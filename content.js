// This script detects mouse gestures.
let isDrawing = false;
let path = [];
let canvas, ctx;

function setupCanvas() {
  canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('mousedown', (event) => {
  chrome.storage.sync.get('enabled', (data) => {
    if (data.enabled === false) return; // Check if the extension is disabled

    if (event.button === 2) { // Right mouse button
      isDrawing = true;
      path = [{ x: event.clientX, y: event.clientY }];
      if (!canvas) {
        setupCanvas();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      event.preventDefault();
    }
  });
});

window.addEventListener('mousemove', (event) => {
  if (isDrawing) {
    path.push({ x: event.clientX, y: event.clientY });
    ctx.lineTo(event.clientX, event.clientY);
    ctx.strokeStyle = '#0000FF'; // Blue trail
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});

window.addEventListener('contextmenu', (event) => {
  if (path.length > 1) {
    event.preventDefault();
  }
});

function recognizeGesture(callback) {
  if (path.length < 10) { // Ignore short paths
    path = [];
    if (callback) callback(false);
    return;
  }

  const directions = [];
  let lastPoint = path[0];

  for (let i = 1; i < path.length; i++) {
    const point = path[i];
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      if (Math.abs(dx) > Math.abs(dy)) {
        directions.push(dx > 0 ? 'R' : 'L');
      } else {
        directions.push(dy > 0 ? 'D' : 'U');
      }
      lastPoint = point;
    }
  }

  const gesture = directions.filter((d, i) => d !== directions[i - 1]).join('');
  console.log('Recognized gesture:', gesture);

  if (gesture) {
    chrome.runtime.sendMessage({ gesture: gesture }, (response) => {
      if (callback) callback(response && response.success);
    });
  } else {
    if (callback) callback(false);
  }

  path = [];
}

window.addEventListener('mouseup', (event) => {
  if (event.button === 2 && isDrawing) {
    isDrawing = false;
    recognizeGesture((recognized) => {
      ctx.strokeStyle = recognized ? '#00FF00' : '#FF0000'; // Green/Red
      ctx.stroke();
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 500);
    });
  }
});
