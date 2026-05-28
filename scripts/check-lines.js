import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

let hasError = false;

function checkDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;
      if (lines > 500) {
        console.error(`🚨 ERROR (Gobernanza Automática): El archivo ${fullPath.replace(srcDir, 'src')} tiene ${lines} líneas. El límite es 500. Modularízalo antes de hacer commit.`);
        hasError = true;
      }
    }
  }
}

console.log("🔍 Verificando límite de 500 líneas (Regla ROL 2)...");
checkDirectory(srcDir);

if (hasError) {
  console.error("❌ Commit bloqueado. Reduce las líneas de los archivos indicados.");
  process.exit(1);
} else {
  console.log("✅ Gobernanza: Todos los archivos respetan el límite estricto.");
}
