import datetime
from celery import shared_task
from exponent_server_sdk import (
    PushClient,
    PushMessage,
    PushServerError,
)
from requests.exceptions import ConnectionError, HTTPError

from .models import StudentFlashcardProgress

def send_push_message(token, message, extra=None):
    try:
        response = PushClient().publish(
            PushMessage(to=token, body=message, data=extra)
        )
    except (PushServerError, ConnectionError, HTTPError) as exc:
        print(f"Error sending push notification: {exc}")
        return False
    return True

@shared_task
def send_daily_review_reminders():
    """
    Tâche exécutée quotidiennement pour envoyer des notifications push
    aux étudiants ayant des flashcards à réviser aujourd'hui (ou en retard).
    """
    today = datetime.date.today()
    
    # Récupérer les étudiants distincts qui ont des révisions à faire
    progresses = StudentFlashcardProgress.objects.filter(
        next_review__lte=today,
        student__expo_push_token__isnull=False
    ).select_related('student')
    
    # Grouper par étudiant pour ne pas envoyer 50 notifications au même étudiant
    students_to_notify = {}
    for p in progresses:
        if p.student not in students_to_notify:
            students_to_notify[p.student] = 0
        students_to_notify[p.student] += 1
        
    count = 0
    for student, review_count in students_to_notify.items():
        if student.expo_push_token:
            msg = f"Salut {student.first_name}, tu as {review_count} notion(s) à réviser aujourd'hui pour garder ton rythme !"
            success = send_push_message(student.expo_push_token, msg)
            if success:
                count += 1
                
    return f"Sent {count} notifications for daily reviews."
