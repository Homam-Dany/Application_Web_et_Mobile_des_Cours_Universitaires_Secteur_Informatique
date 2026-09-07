# Changelog

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

## [Unreleased] - Phase de Pré-production

### Ajouté
- Mode Hors-Ligne pour l'application mobile (Expo SQLite).
- Notifications Push (Expo Notifications).
- Intégration Apple Sign-In pour la conformité iOS.
- Écran légal / Conditions d'utilisation et politique de confidentialité (Conformité App Store / Play Store).
- Graphe de connaissances et détection des prérequis (NetworkX).
- Génération de résumés de chapitres via IA (Gemini Flash).
- Traitement asynchrone des tâches via Celery + Redis.
- Modèle `Concept` et relations de prérequis pour suivre la progression de l'étudiant.
- Indicateur d'ambiguïté pour le signalement de questions par les utilisateurs.
- Configuration OTA (Over-The-Air) pour Expo EAS.
- Cache global et gestion d'état frontend avec Zustand et TanStack Query (React Query).

### Modifié
- Refonte complète de la gestion d'état frontend.
- Sécurisation du backend Django (Fichier `.env`, suppression de clés en dur, limitation CORS, désactivation DEBUG).
- Remplacement des `print()` par `logging` standard Python.
- Nettoyage des fichiers temporaires (ex: `reprocess.py`).

### Sécurité
- Configuration complète du fichier `.env.example`.
- Retrait des identifiants et variables critiques du gestionnaire de versions (`.gitignore`).
- Ajout du Privacy Manifest (`ios.privacyManifests`) dans `app.json` pour iOS.
