from content.models import Resource
from content.tasks import process_drive_resource

resources = Resource.objects.all()
count = 0
for r in resources:
    if not r.extracted_text or not r.extracted_text.strip():
        print(f"Reprocessing {r.title}...")
        process_drive_resource(r.id)
        count += 1

print(f"Reprocessed {count} files.")
