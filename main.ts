// main.ts — hands the Golden Ladle game in.
// Copies game/ and screenshots/ from this repository to the output
// directory (MAKEFUN_OUTPUT_DIR, or /output) and writes dossier.json
// with buildDossier from vendor/makefun-game.ts. Writes nothing else.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(msg) {
  console.error(`main.ts: ${msg}`);
  process.exit(1);
}

for (const dir of ['game', 'screenshots']) {
  if (!existsSync(join(repoRoot, dir))) fail(`missing ${dir}/ in repository`);
}
if (!existsSync(join(repoRoot, 'game', 'index.html'))) fail('missing game/index.html');

mkdirSync(outDir, { recursive: true });
for (const dir of ['game', 'screenshots']) {
  const dest = join(outDir, dir);
  rmSync(dest, { recursive: true, force: true });
  cpSync(join(repoRoot, dir), dest, { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
