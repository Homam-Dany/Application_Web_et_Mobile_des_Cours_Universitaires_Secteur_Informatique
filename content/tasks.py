import time
import json
from celery import shared_task
from .models import Resource
from quiz.models import QuestionBank, Question, AnswerChoice
from .services import download_file_from_drive, extract_text_from_file_bytes

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
            print(f"Downloading file {resource.drive_file_id} for resource {resource.title}...")
            file_bytes = download_file_from_drive(resource.drive_file_id, mime_type=mime_type)
            
            print("Extracting text...")
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
