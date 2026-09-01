from content.models import Chapter, Resource

chapters = Chapter.objects.all()
seen = {}
count = 0

for chapter in chapters:
    key = (chapter.module_id, chapter.title)
    if key in seen:
        original = seen[key]
        print(f"Merging Chapter {chapter.id} into {original.id} ({chapter.title})")
        # Move all resources
        for resource in chapter.resources.all():
            resource.chapter = original
            resource.save()
        chapter.delete()
        count += 1
    else:
        seen[key] = chapter

print(f"Deduplicated {count} chapters.")
