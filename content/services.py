import io
import os
from django.conf import settings
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaIoBaseDownload
import PyPDF2
import docx

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = os.path.join(settings.BASE_DIR, 'credentials.json')

def get_drive_service():
    """
    Constructs and returns a Google Drive API service instance.
    """
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)
    return service

def download_file_from_drive(file_id, mime_type=None):
    """
    Downloads a file from Google Drive given its ID.
    If it's a Google Doc, it exports it to docx.
    """
    service = get_drive_service()
    
    if mime_type == 'application/vnd.google-apps.document':
        # Export Google Docs as DOCX
        request = service.files().export_media(fileId=file_id, mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    else:
        request = service.files().get_media(fileId=file_id)
        
    file_io = io.BytesIO()
    downloader = MediaIoBaseDownload(file_io, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()
    return file_io.getvalue()

import logging
logger = logging.getLogger(__name__)

def extract_text_from_file_bytes(file_bytes, file_name):
    """
    Extracts text from a file in memory, handling PDF and DOCX.
    """
    file_name_lower = file_name.lower()
    
    try:
        if file_name_lower.endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
            
        elif file_name_lower.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
            
        else:
            return ""
            
    except Exception as e:
        logger.error(f"Error extracting text from {file_name}: {e}")
        return ""
