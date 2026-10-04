#!/usr/bin/env python3
"""Instala la documentación inicial de PDI en el proyecto actual."""
import argparse
import json
import shutil
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', type=Path, default=Path.cwd())
    parser.add_argument('--docs-dir', help='Ruta relativa a la raíz del proyecto (por defecto: pdi_doc)')
    args = parser.parse_args()
    root = args.project_root.resolve()
    chosen = args.docs_dir
    if chosen is None:
        chosen = input('Carpeta de documentación [pdi_doc]: ') if sys.stdin.isatty() else 'pdi_doc'
    raw = chosen.strip() or 'pdi_doc'
    # Una barra inicial indica la carpeta documental dentro del proyecto.
    relative = Path(raw.lstrip('/'))
    if relative == Path('.') or '..' in relative.parts or relative.parts[0] in {'pdi', '.agents', '.pdi'}:
        parser.error('La carpeta documental debe estar dentro del proyecto y fuera de las carpetas reservadas.')
    destination = (root / relative).resolve()
    if not destination.is_relative_to(root):
        parser.error('La carpeta documental debe estar dentro del proyecto.')
    source = Path(__file__).resolve().parents[1] / 'dist_docs'
    agent_template = Path(__file__).resolve().parents[1] / 'templates' / 'AGENTS.project.md'
    config = root / '.pdi' / 'config.json'
    if not source.is_dir() or not (source / 'README.md').is_file():
        parser.error(f'Falta la distribución documental: {source}')
    if not agent_template.is_file():
        parser.error(f'Falta la guía documental para agentes: {agent_template}')
    if destination.exists():
        parser.error(f'El destino ya existe; no se sobrescribe: {destination}')
    if config.exists():
        parser.error(f'PDI ya está configurado: {config}')
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination)
    config.parent.mkdir(parents=True, exist_ok=True)
    config.write_text(json.dumps({'docs_dir': relative.as_posix()}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    agent_file = root / 'AGENTS.md'
    if not agent_file.exists():
        shutil.copyfile(agent_template, agent_file)
        print(f'Guía documental para agentes creada en {agent_file}')
    else:
        print(f'AGENTS.md existente conservado: {agent_file}')
        print(f'Incorpora la guía documental de {agent_template} si aún no está cubierta.')
    print(f'Documentación inicial creada en {destination}')
    print(f'Configuración guardada en {config}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
