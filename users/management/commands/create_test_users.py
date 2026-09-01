from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create test users (Admin and Student)'

    def handle(self, *args, **options):
        # Create Admin
        admin, created = User.objects.get_or_create(
            email='admin@homam.tech',
            defaults={
                'username': 'admin',
                'first_name': 'Homam',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Created Admin: admin@homam.tech / admin123"))
        else:
            self.stdout.write("Admin user already exists.")

        # Create Student
        student, created = User.objects.get_or_create(
            email='student@homam.tech',
            defaults={
                'username': 'student',
                'first_name': 'Test',
                'last_name': 'Etudiant',
                'role': 'student',
                'is_staff': False,
                'is_superuser': False
            }
        )
        if created:
            student.set_password('student123')
            student.save()
            self.stdout.write(self.style.SUCCESS(f"Created Student: student@homam.tech / student123"))
        else:
            self.stdout.write("Student user already exists.")
