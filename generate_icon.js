const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, color, letter) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Letter
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`images/icon${size}.png`, buffer);
  console.log(`Generated icon${size}.png`);
}

createIcon(16, '#4A90E2', 'G');
createIcon(48, '#4A90E2', 'G');
createIcon(128, '#4A90E2', 'G');
