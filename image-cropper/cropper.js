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
const aspectBtns = document.querySelectorAll('.aspect-btn');

let imgNaturalWidth, imgNaturalHeight;
let uploadedFileType = 'image/png';
let zoomLevel = 1;

let isDragging = false;
let isResizing = false;
let dragStartX, dragStartY;

let cropRect = { x: 50, y: 50, width: 100, height: 100 };
let aspectRatio = null; // null = free

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

    cropRect.x = clamp(cropRect.x + dx / zoomLevel, 0, image.width - cropRect.width);
    cropRect.y = clamp(cropRect.y + dy / zoomLevel, 0, image.height - cropRect.height);
    updateCropArea();
  }

  if (isResizing) {
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    let newWidth = cropRect.width + dx / zoomLevel;
    let newHeight = cropRect.height + dy / zoomLevel;

    if (aspectRatio) {
      const [w, h] = aspectRatio.split(':').map(Number);
      const ratio = h / w;
      newHeight = newWidth * ratio;
    }

    newWidth = Math.min(newWidth, image.width - cropRect.x);
    newHeight = Math.min(newHeight, image.height - cropRect.y);

    cropRect.width = Math.max(20, newWidth);
    cropRect.height = Math.max(20, newHeight);
    updateCropArea();
  }
});

resizeHandle.addEventListener('mousedown', e => {
  isResizing = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  e.preventDefault();
  e.stopPropagation();
});

aspectBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    aspectBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const val = btn.dataset.ratio;
    aspectRatio = val === 'free' ? null : val;

    if (aspectRatio) {
      const [w, h] = aspectRatio.split(':').map(Number);
      const ratio = h / w;
      cropRect.height = cropRect.width * ratio;
      updateCropArea();
    }
  });
});

zoomInBtn.addEventListener('click', () => {
  zoomLevel = Math.min(3, zoomLevel + 0.1);
  applyZoom();
});

zoomOutBtn.addEventListener('click', () => {
  zoomLevel = Math.max(0.5, zoomLevel - 0.1);
  applyZoom();
});

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

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'cropped.' + uploadedFileType.split('/')[1];
  link.href = resultCanvas.toDataURL(uploadedFileType);
  link.click();
});

function applyZoom() {
  image.style.transform = `scale(${zoomLevel})`;
}

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

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
