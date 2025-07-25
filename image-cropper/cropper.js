const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const aspectRatioSelect = document.getElementById('aspectRatio');

let naturalWidth, naturalHeight;
let displayWidth, displayHeight;
let scale = 1;
let cropRect = { x: 50, y: 50, width: 150, height: 150 };
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let aspectRatio = null;

function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}

function updateCropUI() {
  cropArea.style.left = cropRect.x + 'px';
  cropArea.style.top = cropRect.y + 'px';
  cropArea.style.width = cropRect.width + 'px';
  cropArea.style.height = cropRect.height + 'px';
}

function fitImage() {
  const container = document.querySelector('.cropper-container');
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const wr = cw / naturalWidth;
  const hr = ch / naturalHeight;
  scale = Math.min(wr, hr, 1);
  displayWidth = naturalWidth * scale;
  displayHeight = naturalHeight * scale;
  image.style.width = displayWidth + 'px';
  image.style.height = displayHeight + 'px';
}

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  downloaded = file.type || 'image/png';

  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    naturalWidth = image.naturalWidth;
    naturalHeight = image.naturalHeight;

    fitImage();
    scale = 1;
    updateCropUI();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
    downloadBtn.disabled = true;
  };
});

// Drag move
cropArea.addEventListener('mousedown', e => {
  if (e.target === cropArea) {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = (e.clientX - dragStartX);
  const dy = (e.clientY - dragStartY);
  let nx = clamp(cropRect.x + dx, 0, displayWidth * scale - cropRect.width);
  let ny = clamp(cropRect.y + dy, 0, displayHeight * scale - cropRect.height);
  cropRect.x = nx;
  cropRect.y = ny;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  updateCropUI();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
});

// Native resize observer
new ResizeObserver(entries => {
  for (const entry of entries) {
    const r = entry.contentRect;
    cropRect.width = r.width;
    cropRect.height = r.height;
    if (aspectRatio) {
      cropRect.height = cropRect.width / aspectRatio;
    }
    updateCropUI();
  }
}).observe(cropArea);

// Zoom
zoomInBtn.addEventListener('click', () => {
  scale = clamp(scale + 0.1, 0.5, 3);
  image.style.width = (displayWidth * scale) + 'px';
  image.style.height = (displayHeight * scale) + 'px';
});
zoomOutBtn.addEventListener('click', () => {
  scale = clamp(scale - 0.1, 0.5, 3);
  image.style.width = (displayWidth * scale) + 'px';
  image.style.height = (displayHeight * scale) + 'px';
});

// Mouse wheel zoom
document.querySelector('.cropper-container').addEventListener('wheel', e => {
  e.preventDefault();
  scale = clamp(scale + (e.deltaY < 0 ? 0.1 : -0.1), 0.5, 3);
  image.style.width = (displayWidth * scale) + 'px';
  image.style.height = (displayHeight * scale) + 'px';
}, { passive: false });

// Aspect ratio
aspectRatioSelect.addEventListener('change', e => {
  const v = e.target.value;
  if (v === 'free') aspectRatio = null;
  else {
    const [w, h] = v.split(':').map(Number);
    aspectRatio = w / h;
    cropRect.height = cropRect.width / aspectRatio;
    updateCropUI();
  }
});

// Crop
cropBtn.addEventListener('click', () => {
  const sx = cropRect.x / scale * (naturalWidth / displayWidth);
  const sy = cropRect.y / scale * (naturalHeight / displayHeight);
  const sw = cropRect.width / scale * (naturalWidth / displayWidth);
  const sh = cropRect.height / scale * (naturalHeight / displayHeight);

  resultCanvas.width = cropRect.width;
  resultCanvas.height = cropRect.height;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropRect.width, cropRect.height);
  downloadBtn.disabled = false;
});

// Download
downloadBtn.addEventListener('click', () => {
  resultCanvas.toBlob(blob => {
    const a = document.createElement('a');
    a.download = 'cropped.' + (downloaded.split('/')[1] || 'png');
    a.href = URL.createObjectURL(blob);
    a.click();
  }, downloaded);
});
