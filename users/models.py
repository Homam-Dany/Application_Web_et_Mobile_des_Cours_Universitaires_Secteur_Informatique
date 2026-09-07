from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Étudiant'),
        ('teacher', 'Enseignant/Admin'),
        ('reviewer', 'Correcteur'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Gamification
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_login_date = models.DateField(null=True, blank=True)
    xp = models.IntegerField(default=0)
    
    # Notifications
    expo_push_token = models.CharField(max_length=255, null=True, blank=True, help_text="Token pour les notifications push Expo")

class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=100, help_text="Emoji or icon class")
    required_xp = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
