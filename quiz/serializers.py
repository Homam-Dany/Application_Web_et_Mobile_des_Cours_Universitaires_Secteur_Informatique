from rest_framework import serializers
from .models import QuestionBank, Question, AnswerChoice, TestSession

class AnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerChoice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = AnswerChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'bank', 'text', 'justification', 'difficulty', 'status', 'source_resource', 'choices']

class QuestionBankSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionBank
        fields = ['id', 'chapter', 'title', 'created_at', 'questions']

class TestSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSession
        fields = '__all__'

from .models import FlashcardDeck, Flashcard, StudentFlashcardProgress

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = '__all__'

class FlashcardDeckSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)
    class Meta:
        model = FlashcardDeck
        fields = '__all__'

class StudentFlashcardProgressSerializer(serializers.ModelSerializer):
    flashcard = FlashcardSerializer(read_only=True)
    class Meta:
        model = StudentFlashcardProgress
        fields = '__all__'
