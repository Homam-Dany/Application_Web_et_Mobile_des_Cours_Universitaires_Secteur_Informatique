from content.models import Module

modules = Module.objects.all()
seen = {}

for module in modules:
    key = (module.stream_id, module.name)
    if key in seen:
        original = seen[key]
        print(f"Merging {module.id} into {original.id} ({module.name})")
        # Move all chapters
        for chapter in module.chapters.all():
            chapter.module = original
            chapter.save()
        module.delete()
    else:
        seen[key] = module

print("Deduplication complete.")
