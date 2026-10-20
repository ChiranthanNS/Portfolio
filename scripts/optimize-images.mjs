import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const projectsDir = path.resolve('public/images/projects');
const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.png'));

console.log('Optimizing project images in:', projectsDir);

for (const file of files) {
  const inputPath = path.join(projectsDir, file);
  const baseName = path.basename(file, '.png');
  const outputPath = path.join(projectsDir, `${baseName}.webp`);

  const originalSize = fs.statSync(inputPath).size;

  await sharp(inputPath)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(outputPath);

  const newSize = fs.statSync(outputPath).size;
  const reduction = (((originalSize - newSize) / originalSize) * 100).toFixed(1);

  console.log(`${file} (${(originalSize / 1024).toFixed(0)} KB) -> ${baseName}.webp (${(newSize / 1024).toFixed(0)} KB) [-${reduction}%]`);
}
