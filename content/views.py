from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count
from datetime import timedelta, date
from django.utils import timezone
from quiz.models import QuestionBank, Question, TestSession
from django.db.models import Avg
from .models import Stream, Module, Chapter, Resource, JobOffer
from .serializers import StreamSerializer, ModuleSerializer, ChapterSerializer, ResourceSerializer, JobOfferSerializer
from core.permissions import IsAdminUserOrReadOnly

User = get_user_model()

class StreamViewSet(viewsets.ModelViewSet):
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class JobOfferViewSet(viewsets.ModelViewSet):
    queryset = JobOffer.objects.all().order_by('-created_at')
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_students = User.objects.filter(role='student').count()
        total_resources = Resource.objects.count()
        total_qcm = Question.objects.count()

        # Distribution
        resource_counts = Resource.objects.values('resource_type').annotate(count=Count('id'))
        dist_dict = {item['resource_type']: item['count'] for item in resource_counts}
        
        resource_distribution = [
            {'name': 'Cours', 'value': dist_dict.get('course', 0), 'color': '#3b82f6'},
            {'name': 'Ateliers', 'value': dist_dict.get('workshop', 0), 'color': '#10b981'},
            {'name': 'Examens', 'value': dist_dict.get('exam', 0), 'color': '#f59e0b'},
            {'name': 'Rapports', 'value': dist_dict.get('report', 0), 'color': '#8b5cf6'},
            {'name': 'Autres', 'value': dist_dict.get('other', 0), 'color': '#6b7280'},
        ]
        
        # Filter out 0 value pieces for a cleaner pie chart
        resource_distribution = [item for item in resource_distribution if item['value'] > 0]

        # Activity mock-up combined with real trend (to be fully implemented later if needed)
        # We will just return some static/dynamic trend for now
        activity_data = [
            {'name': 'Lun', 'upload': 4, 'qcm': 1},
            {'name': 'Mar', 'upload': 3, 'qcm': 2},
            {'name': 'Mer', 'upload': 10, 'qcm': 5},
            {'name': 'Jeu', 'upload': 2, 'qcm': 1},
            {'name': 'Ven', 'upload': 8, 'qcm': 3},
            {'name': 'Sam', 'upload': 1, 'qcm': 0},
            {'name': 'Dim', 'upload': 0, 'qcm': 0},
        ]
        
        # Struggling students (Average score < 10)
        struggling_students = []
        students = User.objects.filter(role='student').annotate(avg_score=Avg('test_sessions__score'))
        for student in students:
            if student.avg_score is not None and student.avg_score < 10:
                struggling_students.append({
                    'id': student.id,
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'email': student.email,
                    'avg_score': round(student.avg_score, 1)
                })

        return Response({
            'total_students': total_students,
            'total_resources': total_resources,
            'total_qcm': total_qcm,
            'resource_distribution': resource_distribution,
            'activity_data': activity_data,
            'struggling_students': struggling_students
        })

class GenerateQCMView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response({"error": "Resource not found"}, status=404)
            
        # Import the Celery task (we will create it next)
        from content.tasks import generate_qcm_for_resource
        
        # Trigger the async task
        generate_qcm_for_resource.delay(resource.id)
        
        return Response({"status": "Generation started", "resource_id": resource.id})
