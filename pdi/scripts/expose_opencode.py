#!/usr/bin/env python3
"""Expone por enlaces simbólicos las skills de PDI a OpenCode en un proyecto."""
import argparse
import os
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.project_root.resolve()
    source = Path(__file__).resolve().parents[1] / 'skills'
    destination = root / '.opencode' / 'skills'
    skills = sorted(p for p in source.iterdir() if (p / 'SKILL.md').is_file())
    if not skills:
        parser.error(f'No hay skills en {source}')
    conflicts = [destination / p.name for p in skills if (destination / p.name).exists() or (destination / p.name).is_symlink()]
    if conflicts:
        parser.error('Ya existen skills con esos nombres: ' + ', '.join(str(p) for p in conflicts))
    destination.mkdir(parents=True, exist_ok=True)
    created = []
    try:
        for skill in skills:
            target = destination / skill.name
            target.symlink_to(Path(os.path.relpath(skill, destination)), target_is_directory=True)
            created.append(target)
    except OSError as exc:
        for target in created:
            target.unlink()
        parser.error(f'No se pudieron crear enlaces simbólicos ({exc}). OpenCode requiere acceso a las skills mediante una ruta que descubra.')
    print(f'{len(created)} skills PDI enlazadas en {destination}')
    if not any((parent / '.git').exists() for parent in (root, *root.parents)):
        print('Aviso: OpenCode puede no descubrir skills locales hasta que el proyecto sea un repositorio Git.')
    print('Reinicia OpenCode para que descubra las skills.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
