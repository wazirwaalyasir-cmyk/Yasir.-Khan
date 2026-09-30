import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const docsDir = path.resolve(rootDir, 'docs');

if (fs.existsSync(distDir)) {
  // 1. Ensure .nojekyll exists to prevent GitHub Pages from ignoring files
  const nojekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '', 'utf-8');
  console.log('Created .nojekyll in dist');

  // 2. Copy index.html to 404.html for GitHub Pages SPA fallback
  const indexPath = path.join(distDir, 'index.html');
  const fallbackPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, fallbackPath);
    console.log('Copied dist/index.html to dist/404.html for GitHub Pages');
  }

  // 3. Also mirror into docs/ folder so users using "Deploy from /docs" on GitHub Pages also succeed
  try {
    if (fs.existsSync(docsDir)) {
      fs.rmSync(docsDir, { recursive: true, force: true });
    }
    fs.cpSync(distDir, docsDir, { recursive: true });
    console.log('Mirrored production build to docs/ folder for GitHub Pages /docs support');
  } catch (err) {
    console.warn('Could not mirror to docs/ folder:', err);
  }
}
