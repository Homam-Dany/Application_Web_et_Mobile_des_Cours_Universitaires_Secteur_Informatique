from django.db import models
from content.models import Chapter, Resource
from django.conf import settings

class QuestionBank(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='question_banks')
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    STATUS_CHOICES = (
        ('draft_ai', 'Brouillon IA'),
        ('validated', 'Validé')
    )
    bank = models.ForeignKey(QuestionBank, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    justification = models.TextField(blank=True, help_text="Explication de la bonne réponse fournie par l'IA")
    difficulty = models.IntegerField(default=1, help_text="Niveau de difficulté de 1 à 5")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft_ai')
    source_resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, null=True, blank=True)
    is_ambiguous = models.BooleanField(default=False, help_text="Détectée automatiquement comme potentiellement fausse/ambiguë")
    concepts = models.ManyToManyField('content.Concept', related_name='questions', blank=True)

    def __str__(self):
        return f"{self.text[:50]}..."

class AnswerChoice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class TestSession(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_sessions')
    bank = models.ForeignKey(QuestionBank, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Session de {self.student.username} sur {self.bank.title}"

class FlashcardDeck(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='flashcard_decks')
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Flashcard(models.Model):
    deck = models.ForeignKey(FlashcardDeck, on_delete=models.CASCADE, related_name='flashcards')
    front = models.TextField()
    back = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.front[:50]}..."

class StudentFlashcardProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flashcard_progress')
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE)
    box = models.IntegerField(default=1)  # Leitner system box (1 to 5)
    next_review = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.flashcard.id} (Box {self.box})"
