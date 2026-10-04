#!/usr/bin/env python3
"""Construye un índice de lectura de los artefactos Markdown de un proyecto PDI."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import unquote

from artifact_links import FENCE_RE, inline_code_positions


ARTIFACT_ID = r"(?:REL-\d{3}|[A-Z][A-Z0-9]*-[A-Z][A-Z0-9]*-\d{3})"
ID_RE = re.compile(rf"(?m)^id:[ \t]*({ARTIFACT_ID})[ \t]*$")
TITLE_RE = re.compile(rf"(?m)^# ({ARTIFACT_ID}) — (.+?)\s*$")
LINK_RE = re.compile(rf"\[({ARTIFACT_ID}) — [^\]]+\]\(([^)]+)\)")
STATE_RE = re.compile(r"^estado:[ \t]*(.+?)[ \t]*$", re.MULTILINE)
RELEASE_RE = re.compile(r"^release:[ \t]*(REL-\d{3})[ \t]*$", re.MULTILINE)


def frontmatter(content: str) -> str:
    if not content.startswith("---\n"):
        return ""
    closing = content.find("\n---", 4)
    return content[4:closing] if closing >= 0 else ""


def body_lines(content: str):
    in_frontmatter = content.startswith("---\n")
    fence = None
    for index, line in enumerate(content.splitlines()):
        if in_frontmatter:
            if index > 0 and line.strip() == "---":
                in_frontmatter = False
            continue
        marker = FENCE_RE.match(line)
        if marker:
            if fence is None:
                fence = marker.group(1)
            elif marker.group(1)[0] == fence[0] and len(marker.group(1)) >= len(fence):
                fence = None
            continue
        if fence is None:
            yield line, inline_code_positions(line)


def linked_ids(line: str, excluded: set[int], source: Path, paths: dict[Path, str]) -> list[str]:
    found = []
    for match in LINK_RE.finditer(line):
        if match.start() in excluded:
            continue
        href = unquote(match.group(2).split("#", 1)[0])
        target = (source.parent / href).resolve()
        ident = paths.get(target)
        if ident == match.group(1) and ident not in found:
            found.append(ident)
    return found


def release_items(content: str, source: Path, paths: dict[Path, str]) -> list[dict]:
    """Extrae únicamente filas explícitas de la tabla «Alcance» de una REL."""
    in_scope = False
    items = []
    for line, excluded in body_lines(content):
        if line == "## Alcance":
            in_scope = True
            continue
        if in_scope and line.startswith("## "):
            break
        if not in_scope or not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 4 or cells[1] in {"Estado delivery", "---"}:
            continue
        subject = linked_ids(cells[0], set(), source, paths)
        if len(subject) != 1:
            continue
        items.append({
            "id": subject[0],
            "status": cells[1],
            "specs": linked_ids(cells[2], set(), source, paths),
            "dependencies": linked_ids(cells[3], set(), source, paths),
        })
    return items


def build_index(doc: Path) -> dict:
    """Lee la documentación vigente; no escribe archivos ni deduce estados ausentes."""
    doc = doc.resolve()
    if not doc.is_dir():
        raise ValueError(f"No existe la carpeta documental: {doc}")
    artifacts = {}
    contents = {}
    paths = {}
    for path in sorted(doc.rglob("*.md")):
        content = path.read_text(encoding="utf-8")
        meta = frontmatter(content)
        ident_match = ID_RE.search(meta)
        title_match = TITLE_RE.search(content)
        if not ident_match or not title_match or ident_match.group(1) != title_match.group(1):
            continue
        ident = ident_match.group(1)
        if ident in artifacts:
            raise ValueError(f"ID duplicado: {ident}")
        state = STATE_RE.search(meta)
        release = RELEASE_RE.search(meta)
        artifacts[ident] = {
            "id": ident,
            "title": title_match.group(2),
            "path": path.relative_to(doc).as_posix(),
            "kind": ident.split("-", 1)[0],
            "area": ident.split("-")[1] if not ident.startswith("REL-") else None,
            "status": state.group(1).strip() if state else None,
            "release": release.group(1) if release else None,
            "references": [],
            "referenced_by": [],
        }
        contents[ident] = content
        paths[path.resolve()] = ident

    for ident, artifact in artifacts.items():
        source = doc / artifact["path"]
        references = set()
        for line, excluded in body_lines(contents[ident]):
            references.update(linked_ids(line, excluded, source, paths))
        artifact["references"] = sorted(references - {ident})
        if artifact["kind"] == "REL":
            artifact["delivery_items"] = release_items(contents[ident], source, paths)
    for ident, artifact in artifacts.items():
        for target in artifact["references"]:
            artifacts[target]["referenced_by"].append(ident)
    for artifact in artifacts.values():
        artifact["referenced_by"].sort()

    return {"docs_dir": doc.name, "artifacts": dict(sorted(artifacts.items()))}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docs-dir", help="Carpeta documental; por defecto, .pdi/config.json o pdi_doc/")
    parser.add_argument("--id", help="Mostrar solo un artefacto y sus enlaces directos")
    parser.add_argument("--kind", help="Filtrar por tipo de artefacto, por ejemplo REL o SPEC")
    parser.add_argument("--area", help="Filtrar por área, por ejemplo EQU")
    parser.add_argument("--status", help="Filtrar por estado documental explícito")
    parser.add_argument("--summary", action="store_true", help="Mostrar un resumen legible")
    args = parser.parse_args()
    root = Path.cwd().resolve()
    config = root / ".pdi" / "config.json"
    configured = json.loads(config.read_text(encoding="utf-8"))["docs_dir"] if config.is_file() else "pdi_doc"
    doc = root / (args.docs_dir or configured)
    try:
        index = build_index(doc)
    except ValueError as error:
        parser.error(str(error))
    index["docs_dir"] = args.docs_dir or configured
    artifacts = index["artifacts"]
    if args.id:
        if args.id not in artifacts:
            parser.error(f"No existe el artefacto {args.id}")
        artifacts = {args.id: artifacts[args.id]}
    for field, value in (("kind", args.kind), ("area", args.area), ("status", args.status)):
        if value:
            artifacts = {ident: item for ident, item in artifacts.items() if item[field] == value}
    if args.summary:
        for artifact in artifacts.values():
            print(f"{artifact['id']}\t{artifact['status'] or 'sin estado'}\t{artifact['title']}")
    else:
        print(json.dumps({"docs_dir": index["docs_dir"], "artifacts": artifacts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
