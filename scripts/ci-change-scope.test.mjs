import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { checksForPaths } from "./ci-change-scope.mjs";

const enabled = (paths) =>
  Object.entries(checksForPaths(paths))
    .filter(([, run]) => run)
    .map(([name]) => name);

test("documentation changes run no product checks", () => {
  assert.deepEqual(
    enabled([
      "README.md",
      "pdi_doc/01_producto/10_entregas/rel-003.md",
      "apps/api/README.md",
    ]),
    [],
  );
});

test("front-end changes run WEB, browser and visual checks without PHPUnit", () => {
  assert.deepEqual(enabled(["apps/web/src/styles.css"]), [
    "web",
    "e2e",
    "visual",
    "image",
    "notices",
  ]);
  assert.deepEqual(enabled(["apps/web/e2e/availability.spec.ts"]), ["e2e"]);
  assert.deepEqual(
    enabled(["apps/web/e2e/visual-regressions.spec.ts-snapshots/menu.png"]),
    ["visual"],
  );
});

test("API changes run PHPUnit and integration checks without WEB build", () => {
  assert.deepEqual(enabled(["apps/api/src/Domain/DailyAvailability.php"]), [
    "api",
    "e2e",
    "image",
    "notices",
  ]);
});

test("infrastructure and shared files run the required checks", () => {
  assert.deepEqual(enabled([".railway/railway.ts"]), ["iac"]);
  assert.deepEqual(enabled(["railway-toolkit.sh"]), ["iac"]);
  assert.deepEqual(enabled(["scripts/railway/toolkit.mjs"]), ["iac"]);
  assert.deepEqual(enabled(["LICENSE"]), ["web", "image", "notices"]);
  assert.deepEqual(enabled(["apps/web/package-lock.json"]), [
    "web",
    "e2e",
    "visual",
    "iac",
    "image",
    "notices",
  ]);
  assert.deepEqual(enabled(["compose.yaml"]), [
    "web",
    "api",
    "e2e",
    "visual",
    "iac",
    "image",
    "notices",
  ]);
  assert.deepEqual(enabled([".github/workflows/web.yml"]), [
    "web",
    "api",
    "e2e",
    "visual",
    "iac",
    "image",
    "notices",
  ]);
});

test("multiple changes combine their checks", () => {
  assert.deepEqual(
    enabled([
      "pdi_doc/README.md",
      "apps/web/src/app/app.ts",
      "apps/api/src/Kernel.php",
    ]),
    ["web", "api", "e2e", "visual", "image", "notices"],
  );
});

test("a missing base commit runs every check instead of skipping validation", () => {
  const { GITHUB_OUTPUT: _githubOutput, ...testEnvironment } = process.env;
  const result = spawnSync(
    process.execPath,
    ["scripts/ci-change-scope.mjs", "0".repeat(40)],
    { encoding: "utf8", env: testEnvironment },
  );
  assert.equal(result.status, 0);
  for (const name of [
    "web",
    "api",
    "e2e",
    "visual",
    "iac",
    "image",
    "notices",
  ]) {
    assert.match(result.stdout, new RegExp(`^${name}=true$`, "m"));
  }
});
