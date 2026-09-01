from django.core.management.base import BaseCommand
from content.models import Stream, Module, Chapter, Resource
from content.services import get_drive_service
from content.tasks import process_drive_resource

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
    return 'other'

class Command(BaseCommand):
    help = 'Import all supported files from a Google Drive folder recursively.'

    def add_arguments(self, parser):
        parser.add_argument('folder_id', type=str, help='ID of the root Google Drive folder to import from')

    def fetch_files_in_folder(self, service, folder_id):
        """Fetches files and subfolders in a specific folder."""
        query = f"'{folder_id}' in parents and trashed=false"
        results = service.files().list(
            q=query,
            pageSize=1000,
            fields="nextPageToken, files(id, name, mimeType)",
            includeItemsFromAllDrives=True,
            supportsAllDrives=True
        ).execute()
        return results.get('files', [])

    def process_folder(self, service, folder_id, current_hierarchy, stream):
        """Recursively process folders and map them to Modules/Chapters."""
        items = self.fetch_files_in_folder(service, folder_id)
        
        module = current_hierarchy.get('module')
        chapter = current_hierarchy.get('chapter')

        for item in items:
            item_id = item['id']
            item_name = item['name']
            mime_type = item['mimeType']

            if mime_type == 'application/vnd.google-apps.folder':
                # Map folder depth to Django models
                try:
                    self.stdout.write(f"Entering folder: {item_name}")
                except UnicodeEncodeError:
                    self.stdout.write("Entering folder: (unprintable name)")
                new_hierarchy = dict(current_hierarchy)
                
                if not module:
                    # Level 1 folders become Modules. Strip professor name if present.
                    import re
                    clean_name = re.sub(r'\s*_\s*Pr\..*', '', item_name)
                    new_module, _ = Module.objects.get_or_create(stream=stream, name=clean_name)
                    new_hierarchy['module'] = new_module
                elif not chapter:
                    # Level 2 folders become Chapters
                    new_chapter, _ = Chapter.objects.get_or_create(module=module, title=item_name)
                    new_hierarchy['chapter'] = new_chapter
                
                self.process_folder(service, item_id, new_hierarchy, stream)
                
            else:
                # It's a file. Import all types.
                if not chapter:
                    # Fallback if there are files in root or level 1
                    if not module:
                        module, _ = Module.objects.get_or_create(stream=stream, name="Général")
                    chapter, _ = Chapter.objects.get_or_create(module=module, title="Ressources non classées")
                
                if Resource.objects.filter(drive_file_id=item_id).exists():
                    try:
                        self.stdout.write(f"  Skipping {item_name} (already imported)")
                    except UnicodeEncodeError:
                        self.stdout.write("  Skipping (already imported)")
                    continue
                
                saved_title = item_name
                if mime_type == 'application/vnd.google-apps.document' and not saved_title.endswith('.docx'):
                    saved_title += '.docx'
                    
                guessed_type = guess_resource_type(saved_title, module.name if module else "")
                    
                resource = Resource.objects.create(
                    chapter=chapter,
                    title=saved_title,
                    resource_type=guessed_type,
                    drive_file_id=item_id,
                    mime_type=mime_type
                )
                try:
                    self.stdout.write(self.style.SUCCESS(f"  Imported: {saved_title}"))
                except UnicodeEncodeError:
                    self.stdout.write(self.style.SUCCESS("  Imported: (unprintable name)"))
                process_drive_resource.delay(resource.id, mime_type)


    def handle(self, *args, **options):
        root_folder_id = options['folder_id']
        self.stdout.write(self.style.NOTICE(f"Connecting to Google Drive..."))

        try:
            service = get_drive_service()
            
            # Root corresponds to a Stream (Filière)
            stream, _ = Stream.objects.get_or_create(name="Import Drive (Root)")
            
            self.stdout.write("Starting recursive scan...")
            self.process_folder(service, root_folder_id, {}, stream)

            self.stdout.write(self.style.SUCCESS("\nImport completed! Background tasks are downloading and extracting text."))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
