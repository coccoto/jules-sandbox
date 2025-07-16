// This script will handle the logic for the options page.
const gestureList = document.getElementById('gesture-list');
const saveButton = document.getElementById('save-gesture');
const actionSelect = document.getElementById('action-select');
const gesturePreview = document.getElementById('gesture-preview');
let gestures = {};
let currentGesture = '';

document.addEventListener('DOMContentLoaded', () => {
  loadGestures();
  const enabledCheckbox = document.getElementById('enabled-checkbox');

  // Load the current enabled state
  chrome.storage.sync.get('enabled', (data) => {
    enabledCheckbox.checked = data.enabled !== false; // enabled by default
  });

  // Save the enabled state when the checkbox is changed
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enabledCheckbox.checked });
  });
});
saveButton.addEventListener('click', saveGesture);

function loadGestures() {
  chrome.storage.sync.get('gestures', (data) => {
    gestures = data.gestures || {};
    renderGestures();
  });
}

function renderGestures() {
  gestureList.innerHTML = '';
  for (const gesture in gestures) {
    const action = gestures[gesture];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${gesture}</td>
      <td>${action}</td>
      <td><button class="delete-btn" data-gesture="${gesture}">Delete</button></td>
    `;
    gestureList.appendChild(row);
  }
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const gestureToDelete = e.target.dataset.gesture;
      delete gestures[gestureToDelete];
      chrome.storage.sync.set({ gestures }, renderGestures);
    });
  });
}

function saveGesture() {
  const action = actionSelect.value;
  if (currentGesture && action) {
    // Basic check for similar gestures
    if (gestures[currentGesture]) {
      alert('This gesture is already assigned. Please draw a different one.');
      return;
    }
    gestures[currentGesture] = action;
    chrome.storage.sync.set({ gestures }, () => {
      renderGestures();
      currentGesture = '';
      gesturePreview.textContent = '';
      // You might want to clear the canvas as well
    });
  }
}

const canvas = document.getElementById('draw-area');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let path = [];

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  path = [{ x: e.offsetX, y: e.offsetY }];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    path.push({ x: e.offsetX, y: e.offsetY });
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    recognizeDrawnGesture();
  }
});

canvas.addEventListener('mouseleave', () => {
  if (isDrawing) {
    isDrawing = false;
    recognizeDrawnGesture();
  }
});

function recognizeDrawnGesture() {
  if (path.length < 10) {
    path = [];
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

  currentGesture = directions.filter((d, i) => d !== directions[i - 1]).join('');
  gesturePreview.textContent = currentGesture;
  path = [];
}
