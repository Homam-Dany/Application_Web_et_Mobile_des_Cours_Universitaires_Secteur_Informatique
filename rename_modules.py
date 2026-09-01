import re
from content.models import Module

modules = Module.objects.all()
count = 0
for m in modules:
    new_name = re.sub(r'\s*_\s*Pr\..*', '', m.name)
    if new_name != m.name:
        print(f"Renaming '{m.name}' -> '{new_name}'")
        m.name = new_name
        m.save()
        count += 1
print(f"Renamed {count} modules.")
