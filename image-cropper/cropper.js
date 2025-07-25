const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const aspectSelect = document.getElementById('aspectRatio');

let imgNaturalWidth, imgNaturalHeight;
let displayedWidth, displayedHeight;
let zoomLevel = 1;

let isDragging = false;
let isResizing = false;
let dragStartX, dragStartY;

let cropRect = { x: 50, y: 50, width: 150, height: 150 };
let aspectRatio = null; // null = freeform

let uploadedFileType = 'image/png';

function fitImageToContainer() {
  const container = document.querySelector('.cropper-container');
  const maxWidth = container.clientWidth;
  const maxHeight = container.clientHeight;

  let width = imgNaturalWidth;
  let height = imgNaturalHeight;

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scale = Math.min(widthRatio, heightRatio, 1); // no upscale

  width = width * scale;
  height = height * scale;

  image.style.width = width + 'px';
  image.style.height = height + 'px';

  displayedWidth = width;
  displayedHeight = height;

  return { width, height };
}

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

    fitImageToContainer();

    image.width = displayedWidth;
    image.height = displayedHeight;

    resetCropArea();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
    downloadBtn.disabled = true;
    applyZoom();
  };
});

function resetCropArea() {
  cropRect = { x: 50, y: 50, width: 150, height: 150 };
  updateCropArea();
}

function updateCropArea() {
  cropArea.style.left = cropRect.x + 'px';
  cropArea.style.top = cropRect.y + 'px';
  cropArea.style.width = cropRect.width + 'px';
  cropArea.style.height = cropRect.height + 'px';
}

// Clamp crop box inside the visible image area
function clampCropToImage() {
  cropRect.x = clamp(cropRect.x, 0, displayedWidth * zoomLevel - cropRect.width);
  cropRect.y = clamp(cropRect.y, 0, displayedHeight * zoomLevel - cropRect.height);
}

function applyZoom() {
  image.style.transform = `scale(${zoomLevel})`;
  cropArea.style.transform = `scale(${zoomLevel})`;
  image.style.transformOrigin = 'top left';
  cropArea.style.transformOrigin = 'top left';
  clampCropToImage();
  updateCropArea();
}

// Zoom buttons
zoomInBtn.addEventListener('click', () => {
  zoomLevel = Math.min(zoomLevel + 0.1, 3);
  applyZoom();
});
zoomOutBtn.addEventListener('click', () => {
  zoomLevel = Math.max(zoomLevel - 0.1, 0.2);
  applyZoom();
});

// Mouse wheel zoom
document.querySelector('.cropper-container').addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) zoomLevel = Math.min(zoomLevel + 0.1, 3);
  else zoomLevel = Math.max(zoomLevel - 0.1, 0.2);
  applyZoom();
}, { passive: false });

// Aspect ratio select
aspectSelect.addEventListener('change', () => {
  const value = aspectSelect.value;
  if (value === 'free') {
    aspectRatio = null;
  } else {
    const [w, h] = value.split(':').map(Number);
    aspectRatio = w / h;
    cropRect.height = cropRect.width / aspectRatio;
    updateCropArea();
  }
});

// Drag crop area
cropArea.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  e.preventDefault();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  dragStartX = e.clientX;
  dragStartY = e.clientY;

  cropRect.x = clamp(cropRect.x + dx, 0, displayedWidth * zoomLevel - cropRect.width);
  cropRect.y = clamp(cropRect.y + dy, 0, displayedHeight * zoomLevel - cropRect.height);

  updateCropArea();
});

// Crop button click
cropBtn.addEventListener('click', () => {
  const scaleX = imgNaturalWidth / (displayedWidth * zoomLevel);
  const scaleY = imgNaturalHeight / (displayedHeight * zoomLevel);

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
  link.download = 'cropped.' + uploadedFileType.split('/')[1];
  link.href = resultCanvas.toDataURL(uploadedFileType);
  link.click();
});

// Utility
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
