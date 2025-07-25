const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const resizeHandle = document.querySelector('.resize-handle');
const cropBtn = document.getElementById('cropBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

let imgNaturalWidth, imgNaturalHeight;
let uploadedFileType = 'image/png';

let isDragging = false;
let isResizing = false;
let dragStartX, dragStartY;
let zoomLevel = 1;

let cropRect = { x: 50, y: 50, width: 100, height: 100 };

// Handle image input
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  uploadedFileType = file.type || 'image/png';
  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    imgNaturalWidth = image.naturalWidth;
    imgNaturalHeight = image.naturalHeight;
    zoomLevel = 1;
    applyZoom();
    resetCropArea();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
  };
});

// Crop area dragging
cropArea.addEventListener('mousedown', e => {
  if (e.target === resizeHandle) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  e.preventDefault();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
});

window.addEventListener('mousemove', e => {
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (isDragging) {
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    cropRect.x = Math.min(Math.max(0, cropRect.x + dx / zoomLevel), image.width - cropRect.width);
    cropRect.y = Math.min(Math.max(0, cropRect.y + dy / zoomLevel), image.height - cropRect.height);
    updateCropArea();
  }

  if (isResizing) {
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    cropRect.width = Math.min(Math.max(20, cropRect.width + dx / zoomLevel), image.width - cropRect.x);
    cropRect.height = Math.min(Math.max(20, cropRect.height + dy / zoomLevel), image.height - cropRect.y);
    updateCropArea();
  }
});

// Resize handle logic
resizeHandle.addEventListener('mousedown', e => {
  isResizing = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  e.stopPropagation();
  e.preventDefault();
});

// Keyboard arrow controls
window.addEventListener('keydown', e => {
  const step = e.shiftKey ? 10 : 1;
  switch (e.key) {
    case 'ArrowUp':
      cropRect.y = Math.max(0, cropRect.y - step);
      break;
    case 'ArrowDown':
      cropRect.y = Math.min(image.height - cropRect.height, cropRect.y + step);
      break;
    case 'ArrowLeft':
      cropRect.x = Math.max(0, cropRect.x - step);
      break;
    case 'ArrowRight':
      cropRect.x = Math.min(image.width - cropRect.width, cropRect.x + step);
      break;
    default:
      return;
  }
  updateCropArea();
});

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  zoomLevel = Math.min(3, zoomLevel + 0.1);
  applyZoom();
});

zoomOutBtn.addEventListener('click', () => {
  zoomLevel = Math.max(0.1, zoomLevel - 0.1);
  applyZoom();
});

function applyZoom() {
  image.style.transform = `scale(${zoomLevel})`;
  cropArea.style.transform = `scale(${zoomLevel})`;
}

// Crop button
cropBtn.addEventListener('click', () => {
  const scaleX = imgNaturalWidth / (image.width);
  const scaleY = imgNaturalHeight / (image.height);

  const sx = cropRect.x * scaleX;
  const sy = cropRect.y * scaleY;
  const sw = cropRect.width * scaleX;
  const sh = cropRect.height * scaleY;

  resultCanvas.width = cropRect.width;
  resultCanvas.height = cropRect.height;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropRect.width, cropRect.height);
  downloadBtn.disabled = false;
});

// Download button
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'cropped' + (uploadedFileType === 'image/jpeg' ? '.jpg' : '.png');
  link.href = resultCanvas.toDataURL(uploadedFileType);
  link.click();
});

// Helpers
function resetCropArea() {
  cropRect = { x: 50, y: 50, width: 100, height: 100 };
  updateCropArea();
}

function updateCropArea() {
  cropArea.style.left = cropRect.x + 'px';
  cropArea.style.top = cropRect.y + 'px';
  cropArea.style.width = cropRect.width
  cropArea.style.width = cropRect.width + 'px';
  cropArea.style.height = cropRect.height + 'px';
}
