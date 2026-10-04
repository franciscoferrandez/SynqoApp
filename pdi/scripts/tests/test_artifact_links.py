import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from artifact_links import validate_document_links


class ArtifactLinkTests(unittest.TestCase):
    def test_fixes_unlinked_references_and_keeps_code_examples(self):
        with tempfile.TemporaryDirectory() as temporary:
            doc = Path(temporary)
            target = doc / "requisitos" / "rf-con-001-consulta.md"
            target.parent.mkdir()
            target.write_text("---\nid: RF-CON-001\n---\n# RF-CON-001 — Crear consulta\n", encoding="utf-8")
            source = doc / "ux" / "flujo.md"
            source.parent.mkdir()
            source.write_text(
                "RF-CON-001 — Crear consulta y RF-CON-001 — Crear consulta.\n"
                "`RF-CON-001 — Crear consulta`\n"
                "```text\nRF-CON-001 — Crear consulta\n```\n",
                encoding="utf-8",
            )

            issues, fixed = validate_document_links(doc)
            self.assertEqual(len(issues), 2)
            self.assertEqual(fixed, 0)
            issues, fixed = validate_document_links(doc, fix=True)
            self.assertEqual(issues, [])
            self.assertEqual(fixed, 2)
            self.assertIn(
                "[RF-CON-001 — Crear consulta](../requisitos/rf-con-001-consulta.md) y "
                "[RF-CON-001 — Crear consulta](../requisitos/rf-con-001-consulta.md)",
                source.read_text(encoding="utf-8"),
            )
            self.assertEqual(validate_document_links(doc), ([], 0))

    def test_rejects_wrong_destination_and_mismatched_title(self):
        with tempfile.TemporaryDirectory() as temporary:
            doc = Path(temporary)
            target = doc / "rf-con-001-consulta.md"
            target.write_text("---\nid: RF-CON-001\n---\n# RF-CON-001 — Crear consulta\n", encoding="utf-8")
            source = doc / "fuente.md"
            source.write_text(
                "[RF-CON-001 — Crear consulta](otro.md)\n"
                "RF-CON-001 — Título incorrecto\n",
                encoding="utf-8",
            )
            issues, fixed = validate_document_links(doc)
            self.assertEqual(fixed, 0)
            self.assertEqual(len(issues), 2)
            self.assertTrue(any("apunta a" in issue for issue in issues))
            self.assertTrue(any("denominación distinta" in issue for issue in issues))


if __name__ == "__main__":
    unittest.main()
