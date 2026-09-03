import os
import django
import sys

# Configure Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from quiz.models import QuestionBank, Question, AnswerChoice
from content.models import Chapter, Module, Stream

# 1. Create a dummy hierarchy if it doesn't exist
stream, _ = Stream.objects.get_or_create(name="Informatique de Base", description="Tronc commun")
module, _ = Module.objects.get_or_create(stream=stream, name="Algorithmique")
chapter, _ = Chapter.objects.get_or_create(module=module, title="Les Boucles", order=1)

# 2. Create the Question Bank
bank = QuestionBank.objects.create(
    chapter=chapter,
    title="Quiz d'évaluation : Les Boucles en Algorithmique"
)

# 3. Create Questions and Choices
q1 = Question.objects.create(
    bank=bank,
    text="Quelle boucle est garantie de s'exécuter au moins une fois ?",
    justification="La boucle 'Faire ... Tant Que' (Do...While) évalue sa condition à la fin, elle s'exécute donc toujours au moins une fois.",
    difficulty=2,
    status='validated'
)
AnswerChoice.objects.create(question=q1, text="La boucle POUR (For)", is_correct=False)
AnswerChoice.objects.create(question=q1, text="La boucle TANT QUE (While)", is_correct=False)
AnswerChoice.objects.create(question=q1, text="La boucle FAIRE ... TANT QUE (Do...While)", is_correct=True)

q2 = Question.objects.create(
    bank=bank,
    text="Quel est le risque principal d'une boucle mal conditionnée ?",
    justification="Si la condition de sortie n'est jamais atteinte, la boucle continue indéfiniment, ce qu'on appelle une boucle infinie.",
    difficulty=1,
    status='validated'
)
AnswerChoice.objects.create(question=q2, text="Une boucle infinie", is_correct=True)
AnswerChoice.objects.create(question=q2, text="Une erreur de syntaxe", is_correct=False)
AnswerChoice.objects.create(question=q2, text="Une fuite de mémoire immédiate", is_correct=False)

q3 = Question.objects.create(
    bank=bank,
    text="Dans une boucle 'POUR i ALLANT DE 1 A 5', quelle est la valeur finale de i après l'exécution ?",
    justification="À la fin de la dernière itération, i vaut 5. Ensuite, la condition d'arrêt est atteinte.",
    difficulty=3,
    status='validated'
)
AnswerChoice.objects.create(question=q3, text="4", is_correct=False)
AnswerChoice.objects.create(question=q3, text="5", is_correct=True)
AnswerChoice.objects.create(question=q3, text="6", is_correct=False)

print("✅ QCM factice généré avec succès !")
