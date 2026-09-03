from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from content.views import StreamViewSet, ModuleViewSet, ChapterViewSet, ResourceViewSet, AdminStatsView, GenerateQCMView, JobOfferViewSet
from quiz.views import QuestionBankViewSet, QuestionViewSet, AnswerChoiceViewSet, TestSessionViewSet, CodeEvaluateView, ChatbotView, StudentStatsView, FlashcardDeckViewSet, FlashcardViewSet, StudentFlashcardProgressViewSet, TutorChatView

router = DefaultRouter()
router.register(r'streams', StreamViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'chapters', ChapterViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'job-offers', JobOfferViewSet, basename='joboffer')
router.register(r'question-banks', QuestionBankViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'answer-choices', AnswerChoiceViewSet)
router.register(r'test-sessions', TestSessionViewSet)
router.register(r'flashcard-decks', FlashcardDeckViewSet)
router.register(r'flashcards', FlashcardViewSet)
router.register(r'flashcard-progress', StudentFlashcardProgressViewSet)

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('users/', include('users.urls')),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('resources/<int:resource_id>/generate_qcm/', GenerateQCMView.as_view(), name='generate_qcm'),
    path('code/evaluate/', CodeEvaluateView.as_view(), name='code_evaluate'),
    path('chat/', ChatbotView.as_view(), name='chat'),
    path('student/stats/', StudentStatsView.as_view(), name='student_stats'),
    path('tutor/chat/', TutorChatView.as_view(), name='tutor_chat'),
]
