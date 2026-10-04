import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from artifact_index import build_index


class ArtifactIndexTests(unittest.TestCase):
    def test_status_links_reverse_links_and_release_delivery(self):
        with tempfile.TemporaryDirectory() as temporary:
            doc = Path(temporary)
            requirement = doc / "requisitos" / "rf-equ-001-crear-equipo.md"
            requirement.parent.mkdir()
            requirement.write_text(
                "---\nid: RF-EQU-001\nestado: en_revision\n---\n"
                "# RF-EQU-001 — Crear equipo\n",
                encoding="utf-8",
            )
            release = doc / "rel-001-demo.md"
            release.write_text(
                "---\nid: REL-001\nestado: planificada\n---\n"
                "# REL-001 — Demo\n\n## Alcance\n\n"
                "| Elemento | Estado delivery | SPEC | Dependencias |\n"
                "|---|---|---|---|\n"
                "| [RF-EQU-001 — Crear equipo](requisitos/rf-equ-001-crear-equipo.md) | PLANIFICADO | — | — |\n",
                encoding="utf-8",
            )
            spec = doc / "spec-equ-001-arranque.md"
            spec.write_text(
                "---\nid: SPEC-EQU-001\nestado: ready\nrelease: REL-001\n---\n"
                "# SPEC-EQU-001 — Arranque\n"
                "[RF-EQU-001 — Crear equipo](requisitos/rf-equ-001-crear-equipo.md)\n"
                "[REL-001 — Demo](rel-001-demo.md)\n"
                "`[RF-EQU-001 — Crear equipo](requisitos/rf-equ-001-crear-equipo.md)`\n"
                "```md\n[RF-EQU-001 — Crear equipo](requisitos/rf-equ-001-crear-equipo.md)\n```\n",
                encoding="utf-8",
            )
            index = build_index(doc)
            artifacts = index["artifacts"]
            self.assertEqual(set(artifacts), {"RF-EQU-001", "REL-001", "SPEC-EQU-001"})
            self.assertEqual(artifacts["SPEC-EQU-001"]["references"], ["REL-001", "RF-EQU-001"])
            self.assertEqual(artifacts["RF-EQU-001"]["referenced_by"], ["REL-001", "SPEC-EQU-001"])
            self.assertEqual(artifacts["SPEC-EQU-001"]["status"], "ready")
            self.assertEqual(artifacts["SPEC-EQU-001"]["release"], "REL-001")
            self.assertEqual(artifacts["REL-001"]["delivery_items"], [
                {"id": "RF-EQU-001", "status": "PLANIFICADO", "specs": [], "dependencies": []}
            ])

    def test_ignores_wrong_target_and_does_not_infer_status(self):
        with tempfile.TemporaryDirectory() as temporary:
            doc = Path(temporary)
            (doc / "rf-dis-001.md").write_text(
                "---\nid: RF-DIS-001\n---\n# RF-DIS-001 — Marcar disponibilidad\n",
                encoding="utf-8",
            )
            (doc / "spec-dis-001.md").write_text(
                "---\nid: SPEC-DIS-001\n---\n# SPEC-DIS-001 — Calendario\n"
                "[RF-DIS-001 — Marcar disponibilidad](equivocado.md)\n",
                encoding="utf-8",
            )
            artifacts = build_index(doc)["artifacts"]
            self.assertIsNone(artifacts["RF-DIS-001"]["status"])
            self.assertEqual(artifacts["SPEC-DIS-001"]["references"], [])
            self.assertEqual(artifacts["RF-DIS-001"]["referenced_by"], [])


if __name__ == "__main__":
    unittest.main()
