// tsc ne copie pas les fichiers .sql : on les place à côté du code compilé.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const source = "src/db/migrations";
const destination = "dist/db/migrations";

mkdirSync(destination, { recursive: true });

for (const entry of readdirSync(source, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".sql")) {
    copyFileSync(join(source, entry.name), join(destination, entry.name));
  }
}
