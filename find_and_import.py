# Script to find root and import

from content.models import Resource
from content.services import get_drive_service
from django.core.management import call_command

service = get_drive_service()
current_id = Resource.objects.first().drive_file_id

print("Finding root...")
while True:
    file = service.files().get(fileId=current_id, fields='id, name, parents').execute()
    parents = file.get('parents')
    if not parents:
        break
    print(f"Parent: {file.get('name')} -> {parents}")
    current_id = parents[0]

root_id = current_id
print(f"Root ID found: {root_id}")

print("Running import_drive...")
call_command('import_drive', root_id)
print("Done!")
