import os
from django.conf import settings
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from content.services import get_drive_service

service = get_drive_service()
print("Connected to Drive.")
results = service.files().list(
    pageSize=50,
    fields="files(id, name, mimeType)",
    includeItemsFromAllDrives=True,
    supportsAllDrives=True
).execute()

files = results.get('files', [])
print(f"Found {len(files)} files in total shared with service account.")
for f in files:
    print(f"- {f['name']} ({f['mimeType']}) ID: {f['id']}")
