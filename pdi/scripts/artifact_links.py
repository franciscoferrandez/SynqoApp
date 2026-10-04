#!/usr/bin/env python3
"""Comprueba y, opcionalmente, enlaza referencias a artefactos del proyecto."""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from urllib.parse import unquote


ID_RE = re.compile(r"(?m)^id:[ \t]*([A-Z][A-Z0-9]*-[A-Z][A-Z0-9]*-\d{3})[ \t]*$")
TITLE_RE = re.compile(r"(?m)^# ([A-Z][A-Z0-9]*-[A-Z][A-Z0-9]*-\d{3}) — (.+?)\s*$")
REF_RE = re.compile(r"(?<![A-Za-z0-9])([A-Z][A-Z0-9]*-[A-Z][A-Z0-9]*-\d{3}) — ")
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")


def artifact_index(doc: Path) -> dict[str, tuple[Path, str]]:
    artifacts = {}
    for path in doc.rglob("*.md"):
        content = path.read_text(encoding="utf-8")
        ident = ID_RE.search(content)
        title = TITLE_RE.search(content)
        if ident and title and ident.group(1) == title.group(1):
            artifacts[ident.group(1)] = (path.resolve(), title.group(2))
    return artifacts


def inline_code_positions(line: str) -> set[int]:
    positions = set()
    i = 0
    while i < len(line):
        if line[i] != "`":
            i += 1
            continue
        end_run = i
        while end_run < len(line) and line[end_run] == "`":
            end_run += 1
        marker = line[i:end_run]
        close = line.find(marker, end_run)
        if close < 0:
            i = end_run
            continue
        positions.update(range(i, close + len(marker)))
        i = close + len(marker)
    return positions


def process_document(path: Path, artifacts: dict[str, tuple[Path, str]], fix: bool = False) -> tuple[list[str], int]:
    content = path.read_text(encoding="utf-8")
    lines = content.splitlines(keepends=True)
    issues = []
    fixed = 0
    frontmatter = bool(lines and lines[0].strip() == "---")
    fence = None

    for index, original in enumerate(lines):
        line_number = index + 1
        line = original.rstrip("\r\n")
        ending = original[len(line):]
        if frontmatter:
            if index > 0 and line.strip() == "---":
                frontmatter = False
            continue
        marker = FENCE_RE.match(line)
        if marker:
            if fence is None:
                fence = marker.group(1)
            elif marker.group(1)[0] == fence[0] and len(marker.group(1)) >= len(fence):
                fence = None
            continue
        if fence is not None or TITLE_RE.match(line):
            continue

        code_positions = inline_code_positions(line)
        replacements = []
        for match in REF_RE.finditer(line):
            if match.start() in code_positions:
                continue
            ident = match.group(1)
            if ident not in artifacts:
                issues.append(f"{path}:{line_number}: referencia a {ident} sin artefacto vigente")
                continue
            target, title = artifacts[ident]
            label = f"{ident} — {title}"
            if not line.startswith(label, match.start()):
                issues.append(f"{path}:{line_number}: denominación distinta para {ident}; se espera «{title}»")
                continue
            end = match.start() + len(label)
            linked = match.start() > 0 and line[match.start() - 1] == "[" and line.startswith("](", end)
            if linked:
                close = line.find(")", end + 2)
                if close < 0:
                    issues.append(f"{path}:{line_number}: enlace incompleto para {ident}")
                    continue
                href = line[end + 2:close].split("#", 1)[0]
                linked_path = (path.parent / unquote(href)).resolve() if href else None
                if linked_path != target:
                    issues.append(f"{path}:{line_number}: enlace de {ident} apunta a {href}, debe apuntar a {target}")
                continue
            if fix:
                href = Path(os.path.relpath(target, path.parent)).as_posix()
                replacements.append((match.start(), end, f"[{label}]({href})"))
                fixed += 1
            else:
                issues.append(f"{path}:{line_number}: falta enlace para {label}")
        for start, end, replacement in reversed(replacements):
            line = line[:start] + replacement + line[end:]
        lines[index] = line + ending

    if fix and fixed:
        path.write_text("".join(lines), encoding="utf-8")
    return issues, fixed


def validate_document_links(doc: Path, fix: bool = False) -> tuple[list[str], int]:
    artifacts = artifact_index(doc)
    issues = []
    fixed = 0
    for path in sorted(doc.rglob("*.md")):
        document_issues, document_fixed = process_document(path, artifacts, fix)
        issues.extend(document_issues)
        fixed += document_fixed
    return issues, fixed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docs-dir", help="Carpeta documental; por defecto, .pdi/config.json o pdi_doc/")
    parser.add_argument("--fix", action="store_true", help="Enlazar referencias sin enlace cuando ID y denominación coinciden")
    args = parser.parse_args()
    root = Path.cwd().resolve()
    config = root / ".pdi" / "config.json"
    configured = json.loads(config.read_text(encoding="utf-8"))["docs_dir"] if config.is_file() else "pdi_doc"
    doc = (root / (args.docs_dir or configured)).resolve()
    if not doc.is_dir():
        parser.error(f"No existe la carpeta documental: {doc}")
    issues, fixed = validate_document_links(doc, args.fix)
    print(f"Referencias enlazadas: {fixed}; incidencias: {len(issues)}")
    for issue in issues:
        print("-", issue)
    raise SystemExit(bool(issues))
