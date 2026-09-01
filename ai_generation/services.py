import json
import anthropic
from django.conf import settings

def chunk_text(text, max_chars=4000):
    """
    Splits text into chunks of roughly max_chars length, trying to break on paragraphs.
    """
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        if len(current_chunk) + len(p) < max_chars:
            current_chunk += p + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p + "\n\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def generate_qcm_from_text(text_chunk):
    """
    Calls Anthropic API to generate QCMs from a text chunk.
    Returns a list of dictionaries with question data.
    """
    # client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    prompt = f"""
    En tant qu'expert pédagogique, lis le texte suivant et génère 3 questions à choix multiples (QCM) pour évaluer la compréhension.
    Format de sortie exigé : JSON strict avec une liste d'objets. Chaque objet doit avoir la structure suivante :
    {{
        "question": "Texte de la question",
        "choices": [
            {{"text": "Choix A", "is_correct": true}},
            {{"text": "Choix B", "is_correct": false}},
            {{"text": "Choix C", "is_correct": false}},
            {{"text": "Choix D", "is_correct": false}}
        ],
        "justification": "Explication de la bonne réponse basée sur le texte",
        "difficulty": 2
    }}
    
    Texte :
    {text_chunk}
    """
    
    # Mocking the response for now
    # response = client.messages.create(
    #     model="claude-3-haiku-20240307",
    #     max_tokens=1000,
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return json.loads(response.content[0].text)
    
    return [
        {
            "question": "Quelle est la fonction principale du système décrit ?",
            "choices": [
                {"text": "Réponse correcte générée", "is_correct": True},
                {"text": "Mauvaise réponse A", "is_correct": False},
                {"text": "Mauvaise réponse B", "is_correct": False},
                {"text": "Mauvaise réponse C", "is_correct": False}
            ],
            "justification": "Parce que le texte indique clairement que...",
            "difficulty": 2
        }
    ]
