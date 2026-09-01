from celery import shared_task
from content.models import Resource
from quiz.models import QuestionBank, Question, AnswerChoice
from .services import chunk_text, generate_qcm_from_text

@shared_task
def generate_questions_for_resource(resource_id):
    try:
        resource = Resource.objects.get(id=resource_id)
        if not resource.extracted_text:
            return f"Resource {resource_id} has no extracted text."
            
        chunks = chunk_text(resource.extracted_text)
        
        # Get or create a question bank for this chapter
        bank, created = QuestionBank.objects.get_or_create(
            chapter=resource.chapter,
            defaults={'title': f"Banque - {resource.chapter.title}"}
        )
        
        questions_created = 0
        for chunk in chunks:
            qcm_data_list = generate_qcm_from_text(chunk)
            for qcm_data in qcm_data_list:
                question = Question.objects.create(
                    bank=bank,
                    text=qcm_data['question'],
                    justification=qcm_data.get('justification', ''),
                    difficulty=qcm_data.get('difficulty', 1),
                    status='draft_ai',
                    source_resource=resource
                )
                for choice_data in qcm_data['choices']:
                    AnswerChoice.objects.create(
                        question=question,
                        text=choice_data['text'],
                        is_correct=choice_data['is_correct']
                    )
                questions_created += 1
                
        return f"Generated {questions_created} questions for resource {resource_id}"
    except Resource.DoesNotExist:
        return f"Resource {resource_id} not found."
    except Exception as e:
        return f"Error generating questions: {e}"
