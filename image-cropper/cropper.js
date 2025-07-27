const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const drawCropBtn = document.getElementById('drawCropBtn');
const clearCropBtn = document.getElementById('clearCropBtn');
const cropBtn = document.getElementById('cropBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');
const resultCanvas = document.getElementById('resultCanvas');
const downloadFormat = document.getElementById('downloadFormat');

let startX, startY, isDrawing = false, isMoving = false;
let cropX = 0, cropY = 0, cropWidth = 0, cropHeight = 0;
let imageScale = 1;
let offsetX = 0, offsetY = 0;
let aspectRatio = null;

// Load image
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      image.src = evt.target.result;
      image.onload = () => {
        resetCrop();
      };
    };
    reader.readAsDataURL(file);
  }
});

function resetCrop() {
  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
  imageScale = 1;
  image.style.transform = `scale(${imageScale})`;
}

// Draw new crop
drawCropBtn.addEventListener('click', () => {
  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
});

clearCropBtn.addEventListener('click', resetCrop);

// Zoom
zoomInBtn.addEventListener('click', () => {
  imageScale += 0.1;
  image.style.transform = `scale(${imageScale})`;
});
zoomOutBtn.addEventListener('click', () => {
  imageScale = Math.max(0.1, imageScale - 0.1);
  image.style.transform = `scale(${imageScale})`;
});

// Aspect ratio
aspectRatioSelect.addEventListener('change', () => {
  aspectRatio = aspectRatioSelect.value === 'free' ? null : eval(aspectRatioSelect.value);
});

// Mouse & Touch events for crop area
function getPointerPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

image.addEventListener('mousedown', startDraw);
image.addEventListener('touchstart', startDraw);

function startDraw(e) {
  const pos = getPointerPos(e);
  startX = pos.x - image.offsetLeft;
  startY = pos.y - image.offsetTop;
  isDrawing = true;
  cropArea.style.display = 'block';
  cropArea.style.left = `${startX}px`;
  cropArea.style.top = `${startY}px`;
  cropArea.style.width = `0px`;
  cropArea.style.height = `0px`;
  e.preventDefault();
}

document.addEventListener('mousemove', draw);
document.addEventListener('touchmove', draw);

function draw(e) {
  if (!isDrawing) return;
  const pos = getPointerPos(e);
  let currentX = pos.x - image.offsetLeft;
  let currentY = pos.y - image.offsetTop;
  cropWidth = Math.abs(currentX - startX);
  cropHeight = Math.abs(currentY - startY);

  if (aspectRatio) {
    cropHeight = cropWidth / aspectRatio;
  }

  cropX = Math.min(currentX, startX);
  cropY = Math.min(currentY, startY);
  cropArea.style.left = `${cropX}px`;
  cropArea.style.top = `${cropY}px`;
  cropArea.style.width = `${cropWidth}px`;
  cropArea.style.height = `${cropHeight}px`;
}

document.addEventListener('mouseup', endDraw);
document.addEventListener('touchend', endDraw);

function endDraw() {
  if (isDrawing) {
    isDrawing = false;
    cropBtn.disabled = false;
    clearCropBtn.disabled = false;
  }
}

// Crop and download
cropBtn.addEventListener('click', () => {
  const canvas = resultCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  // Download
  const format = downloadFormat.value;
  const link = document.createElement('a');
  link.download = `cropped.${format.split('/')[1]}`;
  link.href = canvas.toDataURL(format);
  link.click();
});
