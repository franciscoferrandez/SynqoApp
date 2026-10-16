import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const checkNames = ["web", "api", "e2e", "visual", "iac", "image", "notices"];

export function checksForPath(path) {
  const checks = new Set();
  const add = (...names) => names.forEach((name) => checks.add(name));

  if (
    path.startsWith("pdi_doc/") ||
    path.startsWith("doc/") ||
    path.startsWith(".pdi/") ||
    path.endsWith(".md") ||
    path === "AGENTS.md"
  ) {
    return checks;
  }

  if (path === "LICENSE") {
    add("web", "image", "notices");
  } else if (path === "apps/api/LICENSE") {
    add("image", "notices");
  } else if (path.startsWith(".railway/")) {
    add("iac");
  } else if (path === "apps/api/Caddyfile.railway") {
    add("image");
  } else if (path === "apps/api/Dockerfile") {
    add("api", "e2e", "image", "notices");
  } else if (path.startsWith("apps/api/")) {
    add("api", "e2e", "image", "notices");
  } else if (path.startsWith("apps/web/e2e/visual-regressions.spec.ts")) {
    add("visual");
  } else if (path.startsWith("apps/web/e2e/")) {
    add("e2e");
  } else if (path.startsWith("apps/web/")) {
    add("web", "e2e", "visual", "image", "notices");
    if (
      path === "apps/web/.nvmrc" ||
      path === "apps/web/package-lock.json" ||
      path === "apps/web/package.json"
    ) {
      add("iac");
    }
  } else if (path.startsWith("docker/")) {
    add("api", "e2e");
  } else if (path === "package.json" || path === "package-lock.json") {
    add("iac", "notices");
  } else {
    // Shared configuration, CI scripts and unknown files can affect any check.
    add(...checkNames);
  }

  return checks;
}

export function checksForPaths(paths) {
  const checks = new Set();
  for (const path of paths) {
    for (const check of checksForPath(path)) checks.add(check);
  }
  return Object.fromEntries(checkNames.map((name) => [name, checks.has(name)]));
}

function changedPaths(base) {
  if (!/^[0-9a-f]{40}$/.test(base)) return null;
  try {
    execFileSync("git", ["cat-file", "-e", `${base}^{commit}`]);
    return execFileSync("git", [
      "diff",
      "--no-renames",
      "--name-only",
      "-z",
      base,
      "HEAD",
    ])
      .toString("utf8")
      .split("\0")
      .filter(Boolean);
  } catch {
    return null;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const paths = changedPaths(process.argv[2] ?? "");
  const checks =
    paths === null
      ? Object.fromEntries(checkNames.map((name) => [name, true]))
      : checksForPaths(paths);
  if (paths === null)
    console.log(
      "No se pudo leer el commit base; se ejecutarán todos los checks.",
    );
  else
    console.log(
      `Archivos cambiados: ${paths.length}. Checks: ${checkNames.filter((name) => checks[name]).join(", ") || "solo commits"}.`,
    );
  const output =
    checkNames.map((name) => `${name}=${checks[name]}`).join("\n") + "\n";
  if (process.env["GITHUB_OUTPUT"])
    appendFileSync(process.env["GITHUB_OUTPUT"], output);
  else process.stdout.write(output);
}
