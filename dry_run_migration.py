import os
import sys
import django
from django.conf import settings

sys.path.append(os.path.dirname(os.path.abspath('manage.py')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from content.models import Module, Chapter

modules = list(Module.objects.all())
cours_modules = [m for m in modules if m.name.lower().startswith('cours_')]
atelier_modules = [m for m in modules if m.name.lower().startswith('atelier_') or m.name.lower().startswith('ateliers_')]

print(f"Found {len(cours_modules)} cours modules and {len(atelier_modules)} atelier modules.")

mapping = []

for cours in cours_modules:
    # try to find a matching atelier
    # "Cours_POO en Php" -> remove "Cours_", try to match keywords
    base_name = cours.name[6:].strip() # e.g. "POO en Php"
    keywords = [k.lower() for k in base_name.replace('POO', '').replace('en', '').replace('_', ' ').split() if len(k) > 1]
    
    match = None
    for atelier in atelier_modules:
        atelier_base = atelier.name.lower().replace('ateliers_', '').replace('atelier_', '')
        # if any keyword is in atelier_base or vice versa
        if any(k in atelier_base for k in keywords) or (keywords and any(atelier_base in k for k in keywords)):
            match = atelier
            break
            
    if match:
        mapping.append((cours.name, match.name))
        atelier_modules.remove(match)
    else:
        mapping.append((cours.name, None))

print("\n--- Proposed Mapping ---")
for cours_name, atelier_name in mapping:
    print(f"Module: {cours_name}")
    print(f" -> Rename to: {cours_name[6:].strip()}")
    print(f" -> Add 'Cours' chapter for existing content")
    if atelier_name:
        print(f" -> Import TDs from: {atelier_name}")
    else:
        print(f" -> No matching TD/Atelier module found.")
    print("")

print("--- Remaining Atelier Modules ---")
for atelier in atelier_modules:
    print(atelier.name)
