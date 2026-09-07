import time
import json
from celery import shared_task
from .models import Resource
from quiz.models import QuestionBank, Question, AnswerChoice
from .services import download_file_from_drive, extract_text_from_file_bytes

import logging
logger = logging.getLogger(__name__)

@shared_task
def process_drive_resource(resource_id, mime_type=None):
    """
    Celery task to download a resource from Google Drive and extract its text.
    """
    try:
        resource = Resource.objects.get(id=resource_id)
        if not resource.drive_file_id:
            return f"Resource {resource_id} has no drive_file_id."
            
        valid_extract_types = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.google-apps.document'
        ]

        if mime_type in valid_extract_types or resource.title.lower().endswith(('.pdf', '.docx')):
            logger.info(f"Downloading file {resource.drive_file_id} for resource {resource.title}...")
            file_bytes = download_file_from_drive(resource.drive_file_id, mime_type=mime_type)
            
            logger.info("Extracting text...")
            extracted_text = extract_text_from_file_bytes(file_bytes, resource.title)
            
            resource.extracted_text = extracted_text
            resource.save()
            return f"Successfully processed text for resource {resource_id}"
        else:
            return f"Skipped text extraction for resource {resource_id} (unsupported mime type: {mime_type})"
    except Resource.DoesNotExist:
        return f"Resource {resource_id} not found."
    except Exception as e:
        return f"Error processing resource {resource_id}: {e}"

import os
import google.generativeai as genai

@shared_task
def generate_qcm_for_resource(resource_id):
    """
    Integration of Gemini AI to generate questions.
    """
    try:
        resource = Resource.objects.get(id=resource_id)
        
        # Ensure text is extracted if missing
        if not resource.extracted_text and resource.drive_file_id:
            process_drive_resource(resource.id, resource.mime_type)
            resource.refresh_from_db()
            
        text = resource.extracted_text
        if not text:
            return "No text available in the resource to generate QCM."
            
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Tu es un professeur expert qui crée des Quiz (QCM) d'évaluation pour tes étudiants.
        À partir du texte du cours suivant, génère exactement 5 questions pertinentes pour tester la compréhension de l'étudiant.
        
        Pour chaque question, tu dois fournir 4 choix de réponse, dont UN SEUL est correct.
        Tu dois également fournir une justification claire expliquant pourquoi la bonne réponse est correcte.
        Le niveau de difficulté doit être entre 1 (Facile) et 5 (Très difficile).
        
        Réponds UNIQUEMENT en JSON avec ce format exact (pas de texte avant ou après) :
        [
            {{
                "text": "La question posée ?",
                "difficulty": 2,
                "justification": "Explication de la réponse...",
                "choices": [
                    {{"text": "Mauvaise réponse 1", "is_correct": false}},
                    {{"text": "Bonne réponse", "is_correct": true}},
                    {{"text": "Mauvaise réponse 2", "is_correct": false}},
                    {{"text": "Mauvaise réponse 3", "is_correct": false}}
                ]
            }}
        ]
        
        Texte du cours :
        \"\"\"
        {text}
        \"\"\"
        """
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # Nettoyage du markdown si l'IA en renvoie
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
            
        try:
            questions_data = json.loads(content)
        except json.JSONDecodeError:
            return "Failed to parse AI JSON response"
        
        # Create a QuestionBank for this Chapter if none exists
        chapter = resource.chapter
        bank, _ = QuestionBank.objects.get_or_create(
            chapter=chapter,
            title=f"QCM: {chapter.title}"
        )
        
        # Save real questions to database
        for q_data in questions_data:
            question = Question.objects.create(
                bank=bank,
                text=q_data.get('text', 'Question manquante'),
                justification=q_data.get('justification', ''),
                difficulty=q_data.get('difficulty', 2),
                status='draft_ai',
                source_resource=resource
            )
            choices = q_data.get('choices', [])
            for choice_data in choices:
                AnswerChoice.objects.create(
                    question=question,
                    text=choice_data.get('text', 'Choix'),
                    is_correct=choice_data.get('is_correct', False)
                )
                
        return f"Generated {len(questions_data)} questions for resource {resource_id}"
        
    except Resource.DoesNotExist:
        return "Resource not found"
    except Exception as e:
        return f"Error generating QCM: {str(e)}"

@shared_task
def generate_chapter_summary(chapter_id):
    """
    Génère un résumé 1-minute d'un chapitre complet en agrégeant le texte de ses ressources.
    """
    from .models import Chapter
    try:
        chapter = Chapter.objects.get(id=chapter_id)
        
        # Agréger le texte des cours
        all_text = ""
        for resource in chapter.resources.filter(resource_type='course'):
            if resource.extracted_text:
                all_text += resource.extracted_text + "\n\n"
                
        if not all_text.strip():
            return "Pas de texte extrait dans les ressources de type 'cours' pour ce chapitre."
            
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Tu es un professeur expert qui sait résumer des concepts complexes.
        Voici le texte complet du chapitre '{chapter.title}'.
        Rédige un résumé "1-minute" ultra-condensé et facile à retenir de ce chapitre. 
        Mets en évidence les 3 ou 4 concepts clés absolus.
        
        Texte :
        \"\"\"
        {all_text}
        \"\"\"
        """
        
        response = model.generate_content(prompt)
        summary = response.text.strip()
        
        chapter.ai_summary = summary
        chapter.save()
        
        return f"Résumé généré avec succès pour le chapitre {chapter.title}."
        
    except Chapter.DoesNotExist:
        return "Chapitre non trouvé."
    except Exception as e:
        return f"Erreur lors de la génération du résumé: {str(e)}"


@shared_task
def generate_exam_subject_from_resource(resource_id):
    """
    Analyse un sujet d'examen existant pour générer un nouveau sujet inédit
    avec un style et une difficulté équivalents.
    """
    from .models import Resource
    try:
        resource = Resource.objects.get(id=resource_id)
        
        if resource.resource_type != 'exam':
            return "La ressource n'est pas un examen."
            
        if not resource.extracted_text:
            return "Texte de l'examen non extrait."
            
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Tu es un professeur d'université chargé de créer un nouveau sujet d'examen (type concours).
        Voici un sujet d'examen passé pour le cours.
        
        Tâche : Analyse le style, le format, le ton, et le niveau de difficulté de cet examen. 
        Génère un NOUVEAU sujet d'examen INÉDIT (QCM) sur des concepts similaires mais avec des questions différentes.
        Génère 5 questions.
        
        Réponds UNIQUEMENT en JSON avec ce format exact :
        [
            {{
                "text": "La nouvelle question difficile posée ?",
                "difficulty": 4,
                "justification": "Explication détaillée de la réponse...",
                "choices": [
                    {{"text": "Mauvaise réponse 1", "is_correct": false}},
                    {{"text": "Bonne réponse", "is_correct": true}},
                    {{"text": "Mauvaise réponse 2", "is_correct": false}},
                    {{"text": "Mauvaise réponse 3", "is_correct": false}}
                ]
            }}
        ]
        
        Ancien sujet d'examen à imiter :
        \"\"\"
        {resource.extracted_text}
        \"\"\"
        """
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
            
        questions_data = json.loads(content)
        
        chapter = resource.chapter
        bank, _ = QuestionBank.objects.get_or_create(
            chapter=chapter,
            title=f"Sujet d'Annales (Généré par IA) - {chapter.title}"
        )
        
        for q_data in questions_data:
            question = Question.objects.create(
                bank=bank,
                text=q_data.get('text', 'Question manquante'),
                justification=q_data.get('justification', ''),
                difficulty=q_data.get('difficulty', 4),
                status='draft_ai',
                source_resource=resource
            )
            choices = q_data.get('choices', [])
            for choice_data in choices:
                AnswerChoice.objects.create(
                    question=question,
                    text=choice_data.get('text', 'Choix'),
                    is_correct=choice_data.get('is_correct', False)
                )
                
        return f"Sujet d'examen généré avec {len(questions_data)} questions inspirées de la ressource {resource_id}."
        
    except Resource.DoesNotExist:
        return "Ressource non trouvée."
    except Exception as e:
        return f"Erreur lors de la génération de l'examen: {str(e)}"
