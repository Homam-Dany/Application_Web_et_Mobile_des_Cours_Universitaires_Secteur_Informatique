from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import QuestionBank, Question, AnswerChoice, TestSession, FlashcardDeck, Flashcard, StudentFlashcardProgress
from .serializers import QuestionBankSerializer, QuestionSerializer, AnswerChoiceSerializer, TestSessionSerializer, FlashcardDeckSerializer, FlashcardSerializer, StudentFlashcardProgressSerializer
from django.db.models import Avg
import time
import random
from rest_framework.decorators import action
from rest_framework import status

class QuestionBankViewSet(viewsets.ModelViewSet):
    queryset = QuestionBank.objects.all()
    serializer_class = QuestionBankSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """
        Endpoint for teachers to validate an AI-generated question.
        """
        question = self.get_object()
        question.status = 'validated'
        question.save()
        return Response({'status': 'question validated'})

class AnswerChoiceViewSet(viewsets.ModelViewSet):
    queryset = AnswerChoice.objects.all()
    serializer_class = AnswerChoiceSerializer

class TestSessionViewSet(viewsets.ModelViewSet):
    queryset = TestSession.objects.all()
    serializer_class = TestSessionSerializer

class FlashcardDeckViewSet(viewsets.ModelViewSet):
    queryset = FlashcardDeck.objects.all()
    serializer_class = FlashcardDeckSerializer

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer

    @action(detail=False, methods=['post'])
    def generate(self, request):
        import google.generativeai as genai
        import os
        import json
        from content.models import Chapter

        chapter_id = request.data.get('chapter_id')
        text_context = request.data.get('text', '')

        if not chapter_id:
            return Response({'error': 'chapter_id requis'}, status=400)

        chapter = Chapter.objects.get(id=chapter_id)
        deck = FlashcardDeck.objects.create(chapter=chapter, title=f"Flashcards: {chapter.title}")

        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Tu es un professeur d'informatique. À partir du texte suivant, génère 5 flashcards pour réviser.
        Réponds UNIQUEMENT en JSON avec ce format exact :
        [
            {{"front": "Question ou concept au recto", "back": "Réponse détaillée au verso"}}
        ]
        Texte :
        {text_context}
        """

        try:
            response = model.generate_content(prompt)
            content = response.text.strip()
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
                
            cards = json.loads(content)
            
            for card in cards:
                Flashcard.objects.create(
                    deck=deck,
                    front=card.get('front', ''),
                    back=card.get('back', '')
                )
            return Response({'status': 'success', 'deck_id': deck.id})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class StudentFlashcardProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentFlashcardProgress.objects.all()
    serializer_class = StudentFlashcardProgressSerializer

    @action(detail=False, methods=['get'])
    def due_cards(self, request):
        from datetime import date
        cards = StudentFlashcardProgress.objects.filter(student=request.user, next_review__lte=date.today())
        serializer = self.get_serializer(cards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        session = self.get_object()
        answers = request.data.get('answers', {}) # format: { question_id: choice_id }
        
        from django.utils import timezone
        
        # Calculate score
        correct_answers = 0
        total_questions = session.bank.questions.count()
        
        for q_id, c_id in answers.items():
            try:
                choice = AnswerChoice.objects.get(id=c_id, question_id=q_id)
                if choice.is_correct:
                    correct_answers += 1
            except AnswerChoice.DoesNotExist:
                pass
                
        # Calculate final score out of 20
        score = (correct_answers / total_questions) * 20 if total_questions > 0 else 0
        
        session.score = score
        session.completed_at = timezone.now()
        session.save()
        
        return Response({
            'score': score,
            'correct_answers': correct_answers,
            'total_questions': total_questions
        })


class CodeEvaluateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import google.generativeai as genai
        import os
        import json

        code = request.data.get('code', '')
        language = request.data.get('language', 'javascript')

        if not code:
            return Response({"error": "No code provided"}, status=400)

        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-flash-latest')
        
        system_prompt = f"""
        Tu es un professeur de programmation stricte mais juste.
        Un étudiant a écrit ce code en {language}.
        
        Analyse et évalue la qualité, l'exactitude et la pertinence de ce code.
        
        Évalue le code et réponds UNIQUEMENT en JSON avec ce format exact :
        {{
            "is_correct": boolean,
            "feedback": "string (explication détaillée de ce qui va ou ne va pas, en français)",
            "hints": ["string", "string"] (si c'est faux, donne 1 ou 2 indices. Si c'est vrai, liste vide),
            "corrected_code": "string (fournis le code corrigé complet si l'étudiant a fait des erreurs, ou une version optimisée. Si le code est parfait, met null)"
        }}

        Code de l'étudiant :
        ```
        {code}
        ```
        """
        
        try:
            response = model.generate_content(system_prompt)
            content = response.text.strip()
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
                
            result = json.loads(content)
            return Response({
                'is_correct': result.get('is_correct', False),
                'feedback': result.get('feedback', ''),
                'hints': result.get('hints', []),
                'corrected_code': result.get('corrected_code', None)
            })
        except Exception as e:
            # Fallback
            return Response({
                'is_correct': False,
                'feedback': f"Erreur lors de l'évaluation : {str(e)}",
                'hints': [],
                'corrected_code': None
            })

import google.generativeai as genai
import os
from django.conf import settings

class ChatbotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        course_id = request.data.get('course_id') # Optional context
        # Reload after key change
        
        if not message:
            return Response({"answer": "Bonjour ! Comment puis-je t'aider aujourd'hui ?"})
            
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "votre_cle_api_gemini_ici":
            return Response({
                "answer": "L'API Gemini n'est pas encore configurée. Veuillez ajouter votre clé GEMINI_API_KEY dans le fichier .env."
            })
            
        genai.configure(api_key=api_key)
        
        # Base prompt
        system_prompt = "Tu es un tuteur pédagogique bienveillant. Réponds de façon concise et encourageante en français. Tu peux utiliser du Markdown pour formater ton code."
        
        # If course_id is provided, we can fetch course content to do RAG
        context = ""
        if course_id:
            try:
                from content.models import Chapter
                # In a real app we'd fetch the specific resource. Here we fetch the first resource of the chapter as an example.
                chapter = Chapter.objects.get(id=course_id)
                resources = chapter.resources.all()
                if resources.exists():
                    context = "Contexte du cours :\n"
                    for r in resources:
                        if r.extracted_text:
                            context += r.extracted_text + "\n"
            except Exception as e:
                pass
                
        full_prompt = f"{system_prompt}\n{context}\nQuestion de l'étudiant: {message}"
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(full_prompt)
            answer = response.text
        except Exception as e:
            answer = f"Erreur lors de la génération : {str(e)}"
            
        return Response({
            "answer": answer
        })
class StudentStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = TestSession.objects.filter(student=user)
        
        total_quizzes = sessions.count()
        average_score = 0
        if total_quizzes > 0:
            scores = [s.score for s in sessions if s.score is not None]
            if scores:
                average_score = sum(scores) / len(scores)

        # Real radar data grouped by Module title
        from django.db.models import Avg
        
        module_scores = sessions.exclude(score__isnull=True).values(
            'bank__chapter__module__name'
        ).annotate(
            avg_score=Avg('score')
        )
        
        radar_data = []
        strengths = []
        weaknesses = []
        
        if module_scores:
            # Convert to radar format (0-100 scale if score is out of 20, we multiply by 5)
            for item in module_scores:
                title = item['bank__chapter__module__name']
                score_20 = item['avg_score']
                score_100 = score_20 * 5
                radar_data.append({
                    "subject": title[:15] + ".." if len(title) > 15 else title,
                    "A": round(score_100),
                    "fullMark": 100
                })
            
            # Sort to find strengths and weaknesses
            sorted_modules = sorted(module_scores, key=lambda x: x['avg_score'])
            
            # Top 2 strengths (highest scores)
            for m in reversed(sorted_modules[-2:]):
                if m['avg_score'] >= 10:
                    strengths.append(m['bank__chapter__module__name'])
                    
            # Bottom 2 weaknesses (lowest scores)
            for m in sorted_modules[:2]:
                if m['avg_score'] < 14: # Anything below 14 can be improved
                    weaknesses.append(m['bank__chapter__module__name'])
        else:
            # Fallback empty radar data if no sessions
            radar_data = [
                {"subject": "Aucune donnée", "A": 0, "fullMark": 100}
            ]

        # Estimated hours based on resources and sessions (30 mins per session)
        estimated_hours = total_quizzes * 0.5
        
        return Response({
            "total_quizzes": total_quizzes,
            "average_score": round(average_score, 1),
            "estimated_hours": estimated_hours,
            "radar_data": radar_data,
            "strengths": strengths,
            "weaknesses": weaknesses
        })
