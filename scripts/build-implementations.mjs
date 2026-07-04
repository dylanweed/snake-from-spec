#!/usr/bin/env node
// Builds every implementation directory (any top-level dir with a package.json
// exposing a "build" script) and assembles them into `_site/` for
// GitHub Pages, each under its own subpath, e.g. `_site/html5/`.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, cpSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const siteDir = join(root, "_site");

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

const implementations = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "scripts")
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(root, name, "package.json")));

for (const name of implementations) {
  const dir = join(root, name);
  console.log(`\nBuilding implementation: ${name}`);
  execSync("npm ci", { cwd: dir, stdio: "inherit" });
  execSync("npm run build", { cwd: dir, stdio: "inherit" });
  cpSync(join(dir, "dist"), join(siteDir, name), { recursive: true });
}

const links = implementations.map((name) => `<li><a href="./${name}/">${name}</a></li>`).join("\n      ");
writeFileSync(
  join(siteDir, "index.html"),
  `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>snake-from-spec</title></head>
  <body>
    <h1>snake-from-spec</h1>
    <p>Implementations generated from the same specification:</p>
    <ul>
      ${links}
    </ul>
  </body>
</html>
`,
);

console.log(`\nBuilt ${implementations.length} implementation(s) into _site/`);
