const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const aspectRatioSelect = document.getElementById('aspectRatio');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

let scale = 1;
let naturalWidth, naturalHeight;
let dragStartX = 0, dragStartY = 0;
let isDragging = false;
let aspectRatio = null;
let uploadedMime = 'image/png';

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  uploadedMime = file.type || 'image/png';

  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    naturalWidth = image.naturalWidth;
    naturalHeight = image.naturalHeight;

    scale = Math.min(800 / naturalWidth, 600 / naturalHeight, 1);
    image.style.width = `${naturalWidth * scale}px`;
    image.style.height = `${naturalHeight * scale}px`;

    cropArea.style.display = 'block';
    cropArea.style.left = '50px';
    cropArea.style.top = '50px';
    cropArea.style.width = '150px';
    cropArea.style.height = aspectRatio ? `${150 / aspectRatio}px` : '150px';

    cropBtn.disabled = false;
    downloadBtn.disabled = true;
  };
});

// Dragging crop area
cropArea.addEventListener('mousedown', (e) => {
  if (e.target !== cropArea) return;
  isDragging = true;
  dragStartX = e.clientX - cropArea.offsetLeft;
  dragStartY = e.clientY - cropArea.offsetTop;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const containerRect = image.getBoundingClientRect();

  let x = e.clientX - dragStartX - containerRect.left;
  let y = e.clientY - dragStartY - containerRect.top;

  // Clamp within image bounds
  const maxX = image.offsetWidth - cropArea.offsetWidth;
  const maxY = image.offsetHeight - cropArea.offsetHeight;
  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  cropArea.style.left = `${x}px`;
  cropArea.style.top = `${y}px`;
});

// Resize crop area
new ResizeObserver(() => {
  if (aspectRatio) {
    const w = cropArea.offsetWidth;
    cropArea.style.height = `${w / aspectRatio}px`;
  }
}).observe(cropArea);

// Aspect ratio
aspectRatioSelect.addEventListener('change', () => {
  const value = aspectRatioSelect.value;
  if (value === 'free') {
    aspectRatio = null;
  } else {
    const [w, h] = value.split(':').map(Number);
    aspectRatio = w / h;
    const width = cropArea.offsetWidth;
    cropArea.style.height = `${width / aspectRatio}px`;
  }
});

// Zoom controls
function applyZoom() {
  image.style.transform = `scale(${scale})`;
}

zoomInBtn.addEventListener('click', () => {
  scale = Math.min(scale + 0.1, 3);
  applyZoom();
});

zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(scale - 0.1, 0.2);
  applyZoom();
});

document.querySelector('.cropper-container').addEventListener('wheel', (e) => {
  e.preventDefault();
  scale += (e.deltaY < 0 ? 0.1 : -0.1);
  scale = Math.max(0.2, Math.min(scale, 3));
  applyZoom();
}, { passive: false });

// Crop and download
cropBtn.addEventListener('click', () => {
  const containerRect = image.getBoundingClientRect();
  const cropRect = cropArea.getBoundingClientRect();

  const offsetX = (cropRect.left - containerRect.left) / scale;
  const offsetY = (cropRect.top - containerRect.top) / scale;
  const width = cropArea.offsetWidth / scale;
  const height = cropArea.offsetHeight / scale;

  resultCanvas.width = cropArea.offsetWidth;
  resultCanvas.height = cropArea.offsetHeight;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(
    image,
    offsetX,
    offsetY,
    width,
    height,
    0,
    0,
    resultCanvas.width,
    resultCanvas.height
  );

  downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
  resultCanvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cropped.png';
    a.click();
  }, uploadedMime);
});
