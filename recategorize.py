# Script to recategorize

from content.models import Resource, Module

def guess_resource_type(title, parent_name):
    combined = f"{title} {parent_name}".lower()
    
    if 'cc ' in combined or ' cc' in combined or 'exam' in combined or 'concours' in combined or 'contrôle' in combined:
        return 'exam'
    elif 'atelier' in combined or 'tp' in combined or 'td' in combined or 'pratique' in combined:
        return 'workshop'
    elif 'rapport' in combined or 'projet' in combined or 'pfm' in combined or 'pfe' in combined:
        return 'report'
    elif 'cours' in combined or 'chapitre' in combined or 'support' in combined or 'partie' in combined:
        return 'course'
    else:
        return 'other'

resources = Resource.objects.all()
updated = 0
for r in resources:
    module_name = r.chapter.module.name if r.chapter and r.chapter.module else ""
    new_type = guess_resource_type(r.title, module_name)
    r.resource_type = new_type
    r.save()
    updated += 1
    print(f"Updated '{r.title}' to {new_type}")

print(f"Recategorized {updated} resources.")
