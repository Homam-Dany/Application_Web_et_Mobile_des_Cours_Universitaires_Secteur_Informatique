from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User, UserBadge, Badge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['badge', 'earned_at']

class UserSerializer(serializers.ModelSerializer):
    badges = UserBadgeSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined', 'current_streak', 'longest_streak', 'xp', 'badges']

from datetime import date, timedelta

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        # Streak logic
        if user.last_login_date != today:
            if user.last_login_date == today - timedelta(days=1):
                user.current_streak += 1
            elif user.last_login_date is None or user.last_login_date < today - timedelta(days=1):
                user.current_streak = 1
            
            if user.current_streak > user.longest_streak:
                user.longest_streak = user.current_streak
                
            user.last_login_date = today
            user.save()

        serializer = UserSerializer(user)
        return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if not email or not password:
            return Response({'error': 'Email et mot de passe sont requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email non vérifié ou invalide'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='student',
            is_active=False  # Requires admin approval
        )

        return Response({'message': 'Compte créé avec succès ! Il doit être validé par un administrateur avant connexion.'}, status=status.HTTP_201_CREATED)

class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin' and request.user.role != 'teacher':
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.filter(role='student').order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
        
    def patch(self, request, pk):
        if request.user.role != 'admin' and request.user.role != 'teacher':
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        try:
            user = User.objects.get(pk=pk, role='student')
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        is_active = request.data.get('is_active')
        if is_active is not None:
            user.is_active = is_active
            user.save()
            return Response({'status': 'updated'})
        return Response({'status': 'bad request'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Compte activé avec succès.'})
        else:
            return Response({'error': 'Lien invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Ancien et nouveau mot de passe sont requis'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(old_password):
            return Response({'error': 'L\'ancien mot de passe est incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Mot de passe mis à jour avec succès'})

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'Compte supprimé avec succès'}, status=status.HTTP_204_NO_CONTENT)

class RegisterPushTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token est requis'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        user.expo_push_token = token
        user.save()
        
        return Response({'message': 'Push token enregistré avec succès'})
