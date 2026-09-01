from django.db import models

class Stream(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Module(models.Model):
    stream = models.ForeignKey(Stream, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.stream.name} - {self.name}"

class Chapter(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Resource(models.Model):
    TYPE_CHOICES = (
        ('course', 'Cours'),
        ('workshop', 'Ateliers / TP'),
        ('exam', 'CC / Examens'),
        ('report', 'Rapports'),
        ('other', 'Autres'),
    )
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    drive_file_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    mime_type = models.CharField(max_length=255, blank=True, null=True)
    extracted_text = models.TextField(blank=True) # Texte brut pour l'IA

    def __str__(self):
        return self.title

class JobOffer(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=100)
    description = models.TextField()
    link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"
