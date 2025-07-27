const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const drawCropBtn = document.getElementById('drawCropBtn');
const clearCropBtn = document.getElementById('clearCropBtn');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

const downloadBtn = document.getElementById('downloadBtn');
const downloadFormatSelect = document.getElementById('downloadFormatSelect');

let imageLoaded = false;
let isDrawing = false;
let startX = 0;
let startY = 0;
let cropRect = { x: 0, y: 0, width: 0, height: 0 };
let scale = 1;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  image.src = url;
  image.style.transform = 'scale(1)';
  scale = 1;

  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  downloadBtn.disabled = true;
  imageLoaded = false;
});

image.addEventListener('load', () => {
  imageLoaded = true;
  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  downloadBtn.disabled = true;
  resetCropRect();
});

function resetCropRect() {
  cropRect = { x: 0, y: 0, width: 0, height: 0 };
  updateCropArea();
}

function updateCropArea() {
  if (cropRect.width > 0 && cropRect.height > 0) {
    cropArea.style.display = 'block';
    cropArea.style.left = cropRect.x + 'px';
    cropArea.style.top = cropRect.y + 'px';
    cropArea.style.width = cropRect.width + 'px';
    cropArea.style.height = cropRect.height + 'px';
  } else {
    cropArea.style.display = 'none';
  }
}

drawCropBtn.addEventListener('click', () => {
  if (!imageLoaded) return alert('Please upload an image first.');

  resetCropRect();
  cropArea.style.display = 'block';
  cropBtn.disabled = true;
  clearCropBtn.disabled = false;
  downloadBtn.disabled = true;

  cropArea.style.cursor = 'crosshair';
});

clearCropBtn.addEventListener('click', () => {
  resetCropRect();
  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  downloadBtn.disabled = true;
});

// DRAWING ONLY ON cropArea

cropArea.addEventListener('mousedown', (e) => {
  if (!imageLoaded) return;
  isDrawing = true;

  const rect = image.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  startX = Math.min(Math.max(offsetX, 0), image.width);
  startY = Math.min(Math.max(offsetY, 0), image.height);

  cropRect.x = startX;
  cropRect.y = startY;
  cropRect.width = 0;
  cropRect.height = 0;

  updateCropArea();

  cropArea.classList.add('drawing');
});

window.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const rect = image.getBoundingClientRect();
  let offsetX = e.clientX - rect.left;
  let offsetY = e.clientY - rect.top;

  offsetX = Math.min(Math.max(offsetX, 0), image.width);
  offsetY = Math.min(Math.max(offsetY, 0), image.height);

  let width = offsetX - startX;
  let height = offsetY - startY;

  const aspectRatioValue = aspectRatioSelect.value;
  if (aspectRatioValue !== 'free' && width !== 0 && height !== 0) {
    const ratio = eval(aspectRatioValue);
    if (Math.abs(width) > Math.abs(height)) {
      height = Math.sign(height) * Math.abs(width) / ratio;
    } else {
      width = Math.sign(width) * Math.abs(height) * ratio;
    }
  }

  if (width < 0) {
    cropRect.x = startX + width;
    cropRect.width = -width;
  } else {
    cropRect.x = startX;
    cropRect.width = width;
  }
  if (height < 0) {
    cropRect.y = startY + height;
    cropRect.height = -height;
  } else {
    cropRect.y = startY;
    cropRect.height = height;
  }

  cropRect.x = Math.min(Math.max(cropRect.x, 0), image.width - cropRect.width);
  cropRect.y = Math.min(Math.max(cropRect.y, 0), image.height - cropRect.height);

  updateCropArea();
});

window.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  isDrawing = false;
  cropArea.classList.remove('drawing');
  if (cropRect.width > 0 && cropRect.height > 0) {
    cropBtn.disabled = false;
    downloadBtn.disabled = true; // Only enable after cropping
  }
});

zoomInBtn.addEventListener('click', () => {
  if (!imageLoaded) return;
  scale = Math.min(scale + 0.1, 3);
  image.style.transform = `scale(${scale})`;
  resetCropRect();
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  downloadBtn.disabled = true;
});

zoomOutBtn.addEventListener('click', () => {
  if (!imageLoaded) return;
  scale = Math.max(scale - 0.1, 0.5);
  image.style.transform = `scale(${scale})`;
  resetCropRect();
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  downloadBtn.disabled = true;
});

cropBtn.addEventListener('click', () => {
  if (!imageLoaded) return;

  const sx = cropRect.x / scale;
  const sy = cropRect.y / scale;
  const sw = cropRect.width / scale;
  const sh = cropRect.height / scale;

  const canvas = resultCanvas;
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

  downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
  const format = downloadFormatSelect.value || 'png';
  const mimeType = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }[format] || 'image/png';

  const dataURL = resultCanvas.toDataURL(mimeType);

  // Create a temporary link and click to download
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `cropped-image.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
