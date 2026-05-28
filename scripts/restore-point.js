import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checkpoint = process.argv[2];
if (!checkpoint) {
  console.error("Error: Por favor provee un nombre para el checkpoint.");
  process.exit(1);
}

const targetDir = path.join(__dirname, '../ops/restore-points', checkpoint);
if (fs.existsSync(targetDir)) {
  console.error(`Error: El checkpoint "${checkpoint}" ya existe.`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    const base = path.basename(src);
    if (base === 'node_modules' || base === '.git' || base === 'dist' || base === 'restore-points' || base === 'ops') {
      return;
    }
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy src
copyRecursive(path.join(__dirname, '../src'), path.join(targetDir, 'src'));

// Copy main configs
const filesToCopy = ['package.json', 'tsconfig.json', 'vite.config.ts', '.env'];
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetDir, file));
  }
});

console.log(`✨ Punto de restauración "${checkpoint}" creado con éxito en ops/restore-points/${checkpoint}`);
