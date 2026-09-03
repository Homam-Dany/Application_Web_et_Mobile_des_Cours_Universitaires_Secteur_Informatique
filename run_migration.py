import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath('manage.py')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from content.models import Module, Chapter, Resource
from django.db import transaction

modules = list(Module.objects.all())
cours_modules = [m for m in modules if m.name.lower().startswith('cours_')]
atelier_modules = [m for m in modules if m.name.lower().startswith('atelier_') or m.name.lower().startswith('ateliers_')]

print(f"Found {len(cours_modules)} cours modules and {len(atelier_modules)} atelier modules.")

with transaction.atomic():
    for cours in cours_modules:
        base_name = cours.name[6:].strip() # "POO en Php"
        keywords = [k.lower() for k in base_name.replace('POO', '').replace('en', '').replace('_', ' ').split() if len(k) > 1]
        
        match = None
        for atelier in atelier_modules:
            atelier_base = atelier.name.lower().replace('ateliers_', '').replace('atelier_', '')
            if any(k in atelier_base for k in keywords) or (keywords and any(atelier_base in k for k in keywords)):
                match = atelier
                break
                
        # 1. Rename the course module
        cours.name = base_name
        cours.save()
        print(f"Renamed module to {base_name}")
        
        # 2. Get or create the 'Cours' chapter
        cours_chapter, created = Chapter.objects.get_or_create(
            module=cours,
            title='Cours'
        )
        
        # 3. Move all resources currently not in 'Cours' into 'Cours' chapter
        # First, find all resources in this module across all chapters (except 'Cours' if it existed)
        chapters = cours.chapters.all()
        for chap in chapters:
            if chap.id != cours_chapter.id:
                for res in chap.resources.all():
                    res.chapter = cours_chapter
                    res.save()
                    print(f"  Moved resource '{res.title}' to Cours chapter")
                
                # Delete empty chapters (like 'Ressources non classées')
                if chap.resources.count() == 0 and chap.title.lower() != 'cours':
                    chap.delete()
                    print(f"  Deleted empty chapter: {chap.title}")

        # 4. If there is a matching TD module, move its contents
        if match:
            print(f"  Found matching TD module: {match.name}")
            # Create TD chapter
            td_chapter, created = Chapter.objects.get_or_create(
                module=cours,
                title='TD'
            )
            
            # Move all resources from match into TD chapter
            for match_chap in match.chapters.all():
                for res in match_chap.resources.all():
                    res.chapter = td_chapter
                    res.save()
                    print(f"  Moved TD resource '{res.title}' to TD chapter")
                    
            # Delete the match module since it's now empty
            match.delete()
            print(f"  Deleted empty atelier module {match.name}")
            atelier_modules.remove(match)

print("Migration completed successfully!")
