const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const clearCropBtn = document.getElementById('clearCropBtn');
const drawCropBtn = document.getElementById('drawCropBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');

const resultCanvas = document.getElementById('resultCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const downloadFormatSelect = document.getElementById('downloadFormatSelect');

let isDrawing = false;
let isDragging = false;
let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;
let cropRect = null;
let scale = 1;
let aspectRatio = null;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
    image.style.display = 'block';
    resetCrop();
  };
  reader.readAsDataURL(file);
});

drawCropBtn.addEventListener('click', () => {
  cropArea.style.display = 'none';
  cropRect = null;
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
});

clearCropBtn.addEventListener('click', () => {
  resetCrop();
});

function resetCrop() {
  cropArea.style.display = 'none';
  cropRect = null;
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
}

const container = document.querySelector('.cropper-container');

// Helper to get correct pointer coordinates (mouse or touch)
function getPointerPos(e) {
  const rect = image.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function pointerDownHandler(e) {
  if (!image.src) return;

  e.preventDefault();

  const { x: clickX, y: clickY } = getPointerPos(e);

  if (cropRect &&
      clickX >= cropRect.left &&
      clickX <= cropRect.left + cropRect.width &&
      clickY >= cropRect.top &&
      clickY <= cropRect.top + cropRect.height) {
    isDragging = true;
    offsetX = clickX - cropRect.left;
    offsetY = clickY - cropRect.top;
  } else {
    isDrawing = true;
    startX = clickX;
    startY = clickY;

    cropArea.style.display = 'block';
    cropArea.style.left = `${startX}px`;
    cropArea.style.top = `${startY}px`;
    cropArea.style.width = '0px';
    cropArea.style.height = '0px';
  }
}

function pointerMoveHandler(e) {
  if (!image.src) return;

  e.preventDefault();

  const { x: currentX, y: currentY } = getPointerPos(e);

  if (isDrawing) {
    let width = currentX - startX;
    let height = currentY - startY;

    if (aspectRatio && aspectRatio !== 'free') {
      const ratio = eval(aspectRatio);
      if (Math.abs(width / height) > ratio) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
    }

    cropArea.style.left = `${Math.min(startX, startX + width)}px`;
    cropArea.style.top = `${Math.min(startY, startY + height)}px`;
    cropArea.style.width = `${Math.abs(width)}px`;
    cropArea.style.height = `${Math.abs(height)}px`;
  } else if (isDragging && cropRect) {
    const newLeft = currentX - offsetX;
    const newTop = currentY - offsetY;

    cropArea.style.left = `${newLeft}px`;
    cropArea.style.top = `${newTop}px`;
  }
}

function pointerUpHandler(e) {
  if (!image.src) return;

  e.preventDefault();

  if (isDrawing) {
    isDrawing = false;
  } else if (isDragging) {
    isDragging = false;
  }

  const rect = cropArea.getBoundingClientRect();
  const imgRect = image.getBoundingClientRect();

  cropRect = {
    left: rect.left - imgRect.left,
    top: rect.top - imgRect.top,
    width: rect.width,
    height: rect.height
  };

  cropBtn.disabled = false;
  clearCropBtn.disabled = false;
}

// Add both mouse and touch events
container.addEventListener('mousedown', pointerDownHandler);
container.addEventListener('mousemove', pointerMoveHandler);
container.addEventListener('mouseup', pointerUpHandler);

container.addEventListener('touchstart', pointerDownHandler, { passive: false });
container.addEventListener('touchmove', pointerMoveHandler, { passive: false });
container.addEventListener('touchend', pointerUpHandler, { passive: false });

aspectRatioSelect.addEventListener('change', () => {
  const value = aspectRatioSelect.value;
  aspectRatio = value === 'free' ? null : value;
});

zoomInBtn.addEventListener('click', () => {
  scale += 0.1;
  image.style.transform = `scale(${scale})`;
});

zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(0.1, scale - 0.1);
  image.style.transform = `scale(${scale})`;
});

cropBtn.addEventListener('click', () => {
  if (!cropRect) return;

  const img = new Image();
  img.src = image.src;
  img.onload = () => {
    const scaleX = img.width / image.getBoundingClientRect().width;
    const scaleY = img.height / image.getBoundingClientRect().height;

    const sx = cropRect.left * scaleX;
    const sy = cropRect.top * scaleY;
    const sw = cropRect.width * scaleX;
    const sh = cropRect.height * scaleY;

    resultCanvas.width = sw;
    resultCanvas.height = sh;

    const ctx = resultCanvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    downloadBtn.disabled = false;
  };
});

downloadBtn.addEventListener('click', () => {
  const format = downloadFormatSelect.value; // "image/png" or "image/jpeg"
  const dataURL = resultCanvas.toDataURL(format);
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `cropped.${format === 'image/png' ? 'png' : 'jpg'}`;
  link.click();
});
