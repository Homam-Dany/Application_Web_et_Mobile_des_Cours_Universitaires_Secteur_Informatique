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

@shared_task
def generate_qcm_for_resource(resource_id):
    """
    Mock integration of Claude AI to generate questions.
    In production, this calls Anthropic's Messages API.
    """
    try:
        resource = Resource.objects.get(id=resource_id)
        
        # Ensure text is extracted if missing
        if not resource.extracted_text and resource.drive_file_id:
            process_drive_resource(resource.id, resource.mime_type)
            resource.refresh_from_db()
            
        text = resource.extracted_text or "Texte par défaut pour la simulation."
        
        # Simulate AI API Call delay
        time.sleep(3)
        
        # Mock Claude response
        mock_response = [
            {
                "text": f"Question générée depuis {resource.title} : Quelle est la principale caractéristique étudiée ?",
                "difficulty": 2,
                "justification": "D'après le document, c'est l'élément central du chapitre.",
                "choices": [
                    {"text": "La bonne réponse évidente", "is_correct": True},
                    {"text": "Un piège classique", "is_correct": False},
                    {"text": "Une option hors-sujet", "is_correct": False},
                    {"text": "Une option absurde", "is_correct": False}
                ]
            },
            {
                "text": f"Dans le cadre de {resource.title}, que signifie le concept clé mentionné en page 2 ?",
                "difficulty": 4,
                "justification": "Le concept est défini explicitement comme tel dans le glossaire.",
                "choices": [
                    {"text": "La définition correcte", "is_correct": True},
                    {"text": "L'ancienne définition", "is_correct": False},
                    {"text": "Une approximation", "is_correct": False},
                    {"text": "Une erreur courante", "is_correct": False}
                ]
            }
        ]
        
        # Create a QuestionBank for this Chapter if none exists
        # Or attach directly if we want
        chapter = resource.chapter
        bank, _ = QuestionBank.objects.get_or_create(
            chapter=chapter,
            title=f"Banque de QCM: {chapter.title}"
        )
        
        # Save mock questions to database
        for q_data in mock_response:
            question = Question.objects.create(
                bank=bank,
                text=q_data['text'],
                justification=q_data['justification'],
                difficulty=q_data['difficulty'],
                status='draft_ai',
                source_resource=resource
            )
            for choice_data in q_data['choices']:
                AnswerChoice.objects.create(
                    question=question,
                    text=choice_data['text'],
                    is_correct=choice_data['is_correct']
                )
                
        return f"Generated {len(mock_response)} questions for resource {resource_id}"
        
    except Resource.DoesNotExist:
        return "Resource not found"
