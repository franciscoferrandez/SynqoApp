#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
from artifact_links import validate_document_links

PDI = Path(__file__).resolve().parents[1]
ROOT = Path.cwd().resolve()
CONFIG = ROOT / ".pdi" / "config.json"
DOC = ROOT / json.loads(CONFIG.read_text(encoding="utf-8"))["docs_dir"] if CONFIG.is_file() else ROOT / "pdi_doc"

REQUIRED = [
    'pdi/README.md','pdi/AGENTS.md','pdi/MANIFEST.md','pdi/plugin.json','pdi/.codex-plugin/plugin.json','pdi/.claude-plugin/plugin.json',
    'pdi/scripts/init.py','pdi/scripts/expose_opencode.py','pdi/templates/AGENTS.project.md','pdi/dist_docs/README.md','pdi/playbooks/01_playbook-documentacion.md','pdi/playbooks/02_playbook-implementacion.md',
    'AGENTS.md',
    'pdi_doc/README.md','pdi_doc/00_gobierno/README.md','pdi_doc/00_gobierno/01_convenciones-documentales.md',
    'pdi_doc/00_gobierno/02_estado-documentacion.md','pdi_doc/00_gobierno/03_guia-operativa.md',
    'pdi_doc/00_gobierno/04_gates.md','pdi_doc/00_gobierno/05_mandamientos.md',
]

STATIC_DIRS = [
'pdi_doc/01_producto','pdi_doc/01_producto/01_vision','pdi_doc/01_producto/02_problema-oportunidad','pdi_doc/01_producto/03_objetivos','pdi_doc/01_producto/04_alcance','pdi_doc/01_producto/05_actores-personas','pdi_doc/01_producto/06_jtbd','pdi_doc/01_producto/07_historias-usuario','pdi_doc/01_producto/08_journeys','pdi_doc/01_producto/09_prd','pdi_doc/01_producto/10_entregas',
'pdi_doc/02_dominio','pdi_doc/02_dominio/01_glosario-dominio','pdi_doc/02_dominio/02_modelo-conceptual','pdi_doc/02_dominio/03_entidades-conceptos','pdi_doc/02_dominio/04_estados-transiciones','pdi_doc/02_dominio/05_invariantes','pdi_doc/02_dominio/06_eventos-dominio',
'pdi_doc/03_requisitos','pdi_doc/03_requisitos/01_funcionales','pdi_doc/03_requisitos/02_reglas-negocio','pdi_doc/03_requisitos/03_datos','pdi_doc/03_requisitos/04_no-funcionales','pdi_doc/03_requisitos/05_restricciones','pdi_doc/03_requisitos/06_atributos-calidad',
'pdi_doc/04_experiencia-usuario','pdi_doc/04_experiencia-usuario/01_arquitectura-informacion','pdi_doc/04_experiencia-usuario/02_flujos','pdi_doc/04_experiencia-usuario/03_wireframes','pdi_doc/04_experiencia-usuario/04_direccion-visual','pdi_doc/04_experiencia-usuario/05_sistema-diseno','pdi_doc/04_experiencia-usuario/06_mockups','pdi_doc/04_experiencia-usuario/07_accesibilidad',
'pdi_doc/05_investigacion-y-decisiones','pdi_doc/05_investigacion-y-decisiones/01_research','pdi_doc/05_investigacion-y-decisiones/02_spikes','pdi_doc/05_investigacion-y-decisiones/03_alternativas','pdi_doc/05_investigacion-y-decisiones/04_rfc','pdi_doc/05_investigacion-y-decisiones/05_adr',
'pdi_doc/06_arquitectura','pdi_doc/06_arquitectura/01_drivers-arquitectonicos','pdi_doc/06_arquitectura/02_vision-general','pdi_doc/06_arquitectura/03_modulos','pdi_doc/06_arquitectura/04_datos','pdi_doc/06_arquitectura/05_integraciones','pdi_doc/06_arquitectura/06_seguridad','pdi_doc/06_arquitectura/07_observabilidad','pdi_doc/06_arquitectura/08_tecnologias',
'pdi_doc/07_desarrollo','pdi_doc/07_desarrollo/01_principios-y-convenciones','pdi_doc/07_desarrollo/02_testing','pdi_doc/07_desarrollo/03_calidad','pdi_doc/07_desarrollo/04_git','pdi_doc/07_desarrollo/05_ci-cd','pdi_doc/07_desarrollo/06_definicion-de-listo','pdi_doc/07_desarrollo/07_definicion-de-terminado','pdi_doc/07_desarrollo/08_modulos',
'pdi_doc/08_especificaciones','pdi_doc/08_especificaciones/01_activas','pdi_doc/08_especificaciones/99_archivadas',
'pdi_doc/09_operacion','pdi_doc/09_operacion/01_despliegue','pdi_doc/09_operacion/02_runbooks','pdi_doc/09_operacion/03_monitorizacion','pdi_doc/09_operacion/04_incidentes',
'pdi_doc/10_historial','pdi_doc/10_historial/01_cambios-relevantes','pdi_doc/10_historial/02_documentos-obsoletos','pdi_doc/10_historial/03_migraciones-documentales',
]

SKILL_SECTIONS = ['## Propósito','## Precondiciones','## Contexto obligatorio','## Procedimiento','## Prohibido','## Gate / salida']

errors=[]
if not DOC.resolve().is_relative_to(ROOT):
    errors.append('La carpeta documental configurada queda fuera del proyecto')
if not (PDI/'skills'/'init'/'SKILL.md').is_file():
    errors.append('Faltan las skills del plugin en pdi/skills')
for rel in REQUIRED:
    path = DOC/rel[8:] if rel.startswith('pdi_doc/') else PDI/rel[4:] if rel.startswith('pdi/') else ROOT/rel
    if not path.is_file(): errors.append(f'Falta archivo obligatorio: {rel}')
for rel in STATIC_DIRS:
    d=DOC/rel[8:]
    if not d.is_dir(): errors.append(f'Falta directorio estático: {rel}')
    elif not (d/'README.md').is_file(): errors.append(f'Falta README: {rel}/README.md')

for p in list(PDI.rglob('*')) + list(DOC.rglob('*')):
    if p.is_file() and p.stat().st_size == 0:
        errors.append(f'Archivo vacío: {p}')

skills = list((PDI/'skills').glob('*/SKILL.md'))
if not skills:
    errors.append('No se encontraron skills en el plugin PDI')
for p in skills:
    txt=p.read_text(encoding='utf-8')
    for sec in SKILL_SECTIONS:
        if sec not in txt:
            errors.append(f'Skill incompleta {p}: falta {sec}')

for p in ROOT.rglob('*:Zone.Identifier'):
    if p.is_file():
        errors.append(f'Archivo Zone.Identifier: {p.relative_to(ROOT)}')

# IDs and area paths in real project docs only. Templates and playbooks are examples.
catalog = DOC/'00_gobierno/06_catalogo-areas.md'
catalog_codes = set()
if catalog.is_file():
    for line in catalog.read_text(encoding='utf-8').splitlines():
        match = re.match(r'^\|\s*([A-Z][A-Z0-9]*)\s*\|', line)
        if match:
            code = match.group(1)
            if code in catalog_codes:
                errors.append(f'Código de área duplicado en el catálogo: {code}')
            catalog_codes.add(code)

id_re = re.compile(r'^id:[ \t]*(\S[^\n]*)$', re.M)
structured_id_re = re.compile(r'^([A-Z][A-Z0-9]*)-([A-Z][A-Z0-9]*)-(\d{3})$')
release_id_re = re.compile(r'^REL-\d{3}$')
requirement_categories = {
    '01_funcionales': 'RF',
    '02_reglas-negocio': 'RN',
    '03_datos': 'RD',
    '04_no-funcionales': 'RNF',
    '05_restricciones': 'RES',
}
ids={}
for p in DOC.rglob('*.md'):
    txt=p.read_text(encoding='utf-8')
    for m in id_re.finditer(txt):
        ident=m.group(1).strip()
        ids.setdefault(ident,[]).append(str(p.relative_to(ROOT)))
        parts = structured_id_re.fullmatch(ident)
        if not parts:
            if release_id_re.fullmatch(ident):
                if p.relative_to(DOC).parts[:2] != ('01_producto', '10_entregas'):
                    errors.append(f'Entrega {ident} fuera de 01_producto/10_entregas: {p.relative_to(ROOT)}')
                if not (p.name.startswith(ident.lower()+'-') or p.name == ident.lower()+'.md'):
                    errors.append(f'Nombre de archivo no coincide con {ident}: {p.relative_to(ROOT)}')
                continue
            errors.append(f'ID con formato inválido en {p.relative_to(ROOT)}: {ident}')
            continue
        kind, area, _ = parts.groups()
        if catalog.is_file() and area not in catalog_codes:
            errors.append(f'Área {area} de {ident} no registrada en el catálogo')
        if not (p.name.startswith(ident.lower()+'-') or p.name == ident.lower()+'.md'):
            errors.append(f'Nombre de archivo no coincide con {ident}: {p.relative_to(ROOT)}')
        rel = p.relative_to(DOC)
        if rel.parts[0] == '03_requisitos' and len(rel.parts) >= 2:
            expected_kind = requirement_categories.get(rel.parts[1])
            if expected_kind:
                if kind != expected_kind:
                    errors.append(f'Tipo {kind} en categoría {rel.parts[1]}: {p.relative_to(ROOT)}')
                folder_area = rel.parts[2] if len(rel.parts) >= 4 else None
                if folder_area != area:
                    errors.append(f'Carpeta de área no coincide con {ident}: {p.relative_to(ROOT)}')
for ident,paths in ids.items():
    if len(paths)>1: errors.append(f'ID duplicado {ident}: {paths}')
if ids and not catalog.is_file():
    errors.append('Falta catálogo de áreas para los IDs documentales')

link_errors, _ = validate_document_links(DOC)
errors.extend(link_errors)

# La distribución también debe contener todos los README estáticos y estar libre de artefactos de proyecto.
for rel in STATIC_DIRS:
    d=PDI/'dist_docs'/rel[8:]
    if not (d/'README.md').is_file(): errors.append(f'Falta README en dist_docs: {rel}')
for p in (PDI/'dist_docs').rglob('*.md'):
    if p.name != 'README.md' and p.parent != PDI/'dist_docs'/'00_gobierno':
        errors.append(f'Artefacto de proyecto en dist_docs: {p}')
if errors:
    print('VALIDATION FAILED')
    for e in errors: print('-',e)
    sys.exit(1)
print('VALIDATION OK')
print(f'Static directories checked: {len(STATIC_DIRS)}')
print(f'Skills checked: {len(skills)}')
