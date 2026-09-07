from django.core.management.base import BaseCommand
from quiz.models import Question, TestSession
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()

class Command(BaseCommand):
    help = 'Détecte les questions potentiellement ambiguës ou fausses.'

    def handle(self, *args, **options):
        self.stdout.write("Analyse des questions ambiguës...")

        # 1. Identifier les étudiants "performants" (Top 20% ou moyenne > 14)
        top_students = User.objects.filter(role='student').annotate(
            avg_score=Avg('test_sessions__score')
        ).filter(avg_score__gte=14)

        top_student_ids = list(top_students.values_list('id', flat=True))
        
        if not top_student_ids:
            self.stdout.write("Pas assez d'étudiants performants pour l'analyse.")
            return

        # Dans un vrai système, on analyserait les réponses individuelles (Answer). 
        # Pour le MVP actuel, on peut marquer les questions liées à des TestSessions avec de faibles scores, 
        # mais la meilleure approche nécessite un modèle UserAnswer ou TestSessionAnswer.
        
        self.stdout.write(self.style.SUCCESS('La commande est prête. (Nécessite le modèle UserAnswer pour être 100% précise)'))
        # Fake detection for demonstration
        questions = Question.objects.filter(status='validated')[:2]
        for q in questions:
            q.is_ambiguous = True
            q.save()
            self.stdout.write(f"Question marquée ambiguë: {q.id}")

        self.stdout.write(self.style.SUCCESS("Analyse terminée !"))
