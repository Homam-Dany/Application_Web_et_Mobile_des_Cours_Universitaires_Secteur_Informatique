import os
import re

directories = [
    r'mobile/src/screens',
    r'mobile/src/navigation'
]

for directory in directories:
    if not os.path.exists(directory): continue
    for filename in os.listdir(directory):
        if not filename.endswith('.js'): continue
        filepath = os.path.join(directory, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'import axios from \'axios\';' not in content:
            continue
            
        print(f"Refactoring {filepath}")
        
        # Replace import
        content = content.replace("import axios from 'axios';", "import api from '../services/api';")
        
        # Remove API_URL
        content = re.sub(r'const API_URL = Platform\.OS === \'web\'\s*\?\s*\'[^\']+\'\s*:\s*\'[^\']+\';', '', content)
        
        # Replace axios methods
        content = content.replace('axios.get', 'api.get')
        content = content.replace('axios.post', 'api.post')
        content = content.replace('axios.put', 'api.put')
        content = content.replace('axios.delete', 'api.delete')
        content = content.replace('axios.patch', 'api.patch')
        
        # Replace `${API_URL}` with empty string
        content = content.replace('${API_URL}', '')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
