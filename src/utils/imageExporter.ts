import { PoetryItem } from '../types/poetry';

export async function generatePoetryImage(poetry: PoetryItem, theme: 'light' | 'dark' = 'light'): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // High-res canvas dimensions (1080 x 1080 for Instagram/WhatsApp status square or 1080 x 1350)
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;

  // Background gradient
  if (theme === 'dark') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1c1527');
    bgGrad.addColorStop(0.5, '#261b36');
    bgGrad.addColorStop(1, '#181222');
    ctx.fillStyle = bgGrad;
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#f9f7fc');
    bgGrad.addColorStop(0.5, '#f1ecf7');
    bgGrad.addColorStop(1, '#e9e2f2');
    ctx.fillStyle = bgGrad;
  }
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  const margin = 50;
  ctx.strokeStyle = theme === 'dark' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(147, 51, 234, 0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Inner subtle border
  ctx.strokeStyle = theme === 'dark' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(147, 51, 234, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);

  // Corner ornaments
  const cornerSize = 30;
  ctx.strokeStyle = theme === 'dark' ? '#c084fc' : '#7e22ce';
  ctx.lineWidth = 3;

  const corners = [
    [margin, margin],
    [width - margin, margin],
    [margin, height - margin],
    [width - margin, height - margin]
  ];

  corners.forEach(([cx, cy], i) => {
    ctx.beginPath();
    const dirX = i % 2 === 0 ? 1 : -1;
    const dirY = i < 2 ? 1 : -1;
    ctx.moveTo(cx, cy + dirY * cornerSize);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dirX * cornerSize, cy);
    ctx.stroke();
  });

  // Top header: Website Title
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = theme === 'dark' ? '#d8b4fe' : '#6b21a8';
  ctx.font = 'bold 36px "Noto Naskh Arabic", "Amiri", serif';
  ctx.fillText('پشتو شاعری', width / 2, 130);

  // Category pill
  if (poetry.category) {
    ctx.font = '500 24px "Noto Naskh Arabic", "Amiri", sans-serif';
    ctx.fillStyle = theme === 'dark' ? '#a855f7' : '#7c3aed';
    ctx.fillText(`• ${poetry.category} •`, width / 2, 175);
  }

  // Divider line with diamond
  ctx.strokeStyle = theme === 'dark' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(147, 51, 234, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 210);
  ctx.lineTo(width / 2 + 120, 210);
  ctx.stroke();

  // Diamond in center
  ctx.fillStyle = theme === 'dark' ? '#c084fc' : '#7e22ce';
  ctx.beginPath();
  ctx.arc(width / 2, 210, 4, 0, Math.PI * 2);
  ctx.fill();

  // Verses / Poetry Lines
  const verses = poetry.poetry_text.split('\n').filter(l => l.trim().length > 0);
  ctx.fillStyle = theme === 'dark' ? '#f5f3ff' : '#1e1b4b';
  
  // Dynamic font size depending on verse count
  const fontSize = verses.length > 6 ? 34 : verses.length > 4 ? 40 : 46;
  const lineHeight = fontSize * 1.8;
  ctx.font = `600 ${fontSize}px "Noto Naskh Arabic", "Amiri", serif`;

  const totalTextHeight = verses.length * lineHeight;
  let startY = (height / 2) - (totalTextHeight / 2) + 30;

  // Make sure startY does not overlap header
  if (startY < 260) startY = 260;

  verses.forEach((verse, idx) => {
    ctx.fillText(verse.trim(), width / 2, startY + (idx * lineHeight));
  });

  // Poet Attribution
  if (poetry.poet_name && poetry.poet_name.trim()) {
    const poetY = Math.min(height - 180, startY + (verses.length * lineHeight) + 60);
    ctx.fillStyle = theme === 'dark' ? '#e9d5ff' : '#4c1d95';
    ctx.font = 'bold 36px "Noto Naskh Arabic", "Amiri", serif';
    ctx.fillText(`— ${poetry.poet_name.trim()}`, width / 2, poetY);
  }

  // Footer: Watermark
  ctx.fillStyle = theme === 'dark' ? 'rgba(192, 132, 252, 0.6)' : 'rgba(107, 33, 168, 0.6)';
  ctx.font = '500 20px "Noto Naskh Arabic", sans-serif';
  ctx.fillText('د پښتو شعر او ادب ډیجیټل ټولګه', width / 2, height - 90);

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
