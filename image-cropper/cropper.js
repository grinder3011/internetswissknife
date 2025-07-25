const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');

const drawCropBtn = document.getElementById('btnDrawCrop');
const clearCropBtn = document.getElementById('btnClearCrop');
const zoomInBtn = document.getElementById('btnZoomIn');
const zoomOutBtn = document.getElementById('btnZoomOut');
const aspectRatioSelect = document.getElementById('selectAspect');

let imgNaturalWidth, imgNaturalHeight;
let scale = 1;
let minScale = 1;
let maxScale = 5;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let isResizing = false;
let resizeHandle = null;
let isDrawing = false;

let cropRect = null; // {x, y, width, height}
let aspectRatio = null; // number or null (free)

const container = document.querySelector('.cropper-container');

// Utility to constrain value between min and max
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Reset crop area to default size/position
function resetCropArea() {
  cropRect = {
    x: image.width * 0.1,
    y: image.height * 0.1,
    width: image.width * 0.3,
    height: image.height * 0.3,
  };
  updateCropArea();
  cropArea.style.display = 'block';
  cropBtn.disabled = false;
  clearCropBtn.disabled = false;
}

// Update cropArea div position and size
function updateCropArea() {
  if (!cropRect) return;
  cropArea.style.left = cropRect.x + 'px';
  cropArea.style.top = cropRect.y + 'px';
  cropArea.style.width = cropRect.width + 'px';
  cropArea.style.height = cropRect.height + 'px';
}

// Clear crop area UI and data
function clearCropArea() {
  cropRect = null;
  cropArea.style.display = 'none';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
}

// Apply aspect ratio locking while resizing
function applyAspectRatio(width, height, isWidthPrimary = true) {
  if (!aspectRatio) return { width, height };
  if (isWidthPrimary) {
    height = width / aspectRatio;
  } else {
    width = height * aspectRatio;
  }
  return { width, height };
}

// Convert mouse/touch event to container-relative coordinates
function getRelativePos(e) {
  const rect = container.getBoundingClientRect();
  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

// Check if point is inside crop rectangle
function pointInCrop(x, y) {
  if (!cropRect) return false;
  return (
    x >= cropRect.x &&
    x <= cropRect.x + cropRect.width &&
    y >= cropRect.y &&
    y <= cropRect.y + cropRect.height
  );
}

// Initialize resize handles — 8 handles around crop rectangle
function getResizeHandleAtPoint(x, y) {
  if (!cropRect) return null;
  const handleSize = 12; // pixels
  const positions = {
    nw: { x: cropRect.x, y: cropRect.y },
    n: { x: cropRect.x + cropRect.width / 2, y: cropRect.y },
    ne: { x: cropRect.x + cropRect.width, y: cropRect.y },
    e: { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2 },
    se: { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
    s: { x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height },
    sw: { x: cropRect.x, y: cropRect.y + cropRect.height },
    w: { x: cropRect.x, y: cropRect.y + cropRect.height / 2 },
  };

  for (const [key, pos] of Object.entries(positions)) {
    if (
      x >= pos.x - handleSize && x <= pos.x + handleSize &&
      y >= pos.y - handleSize && y <= pos.y + handleSize
    ) {
      return key;
    }
  }
  return null;
}

// Resize crop rectangle based on drag delta and handle
function resizeCrop(dx, dy) {
  if (!cropRect || !resizeHandle) return;

  let { x, y, width, height } = cropRect;

  switch (resizeHandle) {
    case 'nw':
      x += dx;
      y += dy;
      width -= dx;
      height -= dy;
      break;
    case 'n':
      y += dy;
      height -= dy;
      break;
    case 'ne':
      y += dy;
      width += dx;
      height -= dy;
      break;
    case 'e':
      width += dx;
      break;
    case 'se':
      width += dx;
      height += dy;
      break;
    case 's':
      height += dy;
      break;
    case 'sw':
      x += dx;
      width -= dx;
      height += dy;
      break;
    case 'w':
      x += dx;
      width -= dx;
      break;
  }

  // Enforce minimum size
  const minSize = 30;
  if (width < minSize) {
    width = minSize;
    if (['nw','w','sw'].includes(resizeHandle)) {
      x = cropRect.x + cropRect.width - width;
    }
  }
  if (height < minSize) {
    height = minSize;
    if (['nw','n','ne'].includes(resizeHandle)) {
      y = cropRect.y + cropRect.height - height;
    }
  }

  // Lock aspect ratio if set
  if (aspectRatio) {
    if (['n','s'].includes(resizeHandle)) {
      width = height * aspectRatio;
      if (resizeHandle === 'n') {
        x = cropRect.x + (cropRect.width - width) / 2;
      }
    } else if (['e','w'].includes(resizeHandle)) {
      height = width / aspectRatio;
      if (resizeHandle === 'w') {
        y = cropRect.y + (cropRect.height - height) / 2;
      }
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        height = width / aspectRatio;
        if (['nw','sw'].includes(resizeHandle)) {
          y = cropRect.y + cropRect.height - height;
        }
      } else {
        width = height * aspectRatio;
        if (['nw','ne'].includes(resizeHandle)) {
          x = cropRect.x + cropRect.width - width;
        }
      }
    }
  }

  // Clamp position and size within image bounds
  x = clamp(x, 0, image.width - width);
  y = clamp(y, 0, image.height - height);
  width = clamp(width, minSize, image.width - x);
  height = clamp(height, minSize, image.height - y);

  cropRect = { x, y, width, height };
  updateCropArea();
}

// Event handlers for drag/move and resize
function onCropAreaPointerDown(e) {
  e.preventDefault();
  if (isDrawing) return; // disable interaction when drawing new rect

  const pos = getRelativePos(e);
  const handle = getResizeHandleAtPoint(pos.x, pos.y);

  if (handle) {
    isResizing = true;
    resizeHandle = handle;
  } else if (pointInCrop(pos.x, pos.y)) {
    isDragging = true;
  }
  dragStartX = pos.x;
  dragStartY = pos.y;
}

function onPointerMove(e) {
  if (isDrawing) {
    e.preventDefault();
    const pos = getRelativePos(e);
    let x = Math.min(pos.x, dragStartX);
    let y = Math.min(pos.y, dragStartY);
    let width = Math.abs(pos.x - dragStartX);
    let height = Math.abs(pos.y - dragStartY);

    if (aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    x = clamp(x, 0, image.width - width);
    y = clamp(y, 0, image.height - height);

    cropRect = { x, y, width, height };
    updateCropArea();
  } else if (isDragging) {
    e.preventDefault();
    const pos = getRelativePos(e);
    const dx = pos.x - dragStartX;
    const dy = pos.y - dragStartY;

    let newX = cropRect.x + dx;
    let newY = cropRect.y + dy;

    newX = clamp(newX, 0, image.width - cropRect.width);
    newY = clamp(newY, 0, image.height - cropRect.height);

    cropRect.x = newX;
    cropRect.y = newY;
    updateCropArea();

    dragStartX = pos.x;
    dragStartY = pos.y;
  } else if (isResizing) {
    e.preventDefault();
    const pos = getRelativePos(e);
    const dx = pos.x - dragStartX;
    const dy = pos.y - dragStartY;

    resizeCrop(dx, dy);

    dragStartX = pos.x;
    dragStartY = pos.y;
  }
}

function onPointerUp(e) {
  isDragging = false;
  isResizing = false;
  resizeHandle = null;
  if (isDrawing) {
    isDrawing = false;
    cropBtn.disabled = false;
    clearCropBtn.disabled = false;
  }
}

// Handle image file input
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  image.onload = () => {
    imgNaturalWidth = image.naturalWidth;
    imgNaturalHeight = image.naturalHeight;

    // Reset scale and container size to image size
    scale = 1;
    image.style.width = imgNaturalWidth + 'px';
    image.style.height = imgNaturalHeight + 'px';
    container.style.width = imgNaturalWidth + 'px';
    container.style.height = imgNaturalHeight + 'px';

    clearCropArea();
    cropBtn.disabled = true;
    clearCropBtn.disabled = true;

    URL.revokeObjectURL(url);
  };
  image.src = url;
});

// Draw new crop rectangle button
drawCropBtn.addEventListener('click', () => {
  isDrawing = true;
  cropRect = null;
  updateCropArea();
  cropArea.style.display = 'block';
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
});

// Clear crop rectangle button
clearCropBtn.addEventListener('click', () => {
  clearCropArea();
});

// Crop image button
cropBtn.addEventListener('click', () => {
  if (!cropRect) return;

  // Calculate scale factor between displayed image and natural image size
  const scaleX = imgNaturalWidth / image.width;
  const scaleY = imgNaturalHeight / image.height;

  // Crop rectangle relative to natural image size
  const sx = cropRect.x * scaleX;
  const sy = cropRect.y * scaleY;
  const sw = cropRect.width * scaleX;
  const sh = cropRect.height * scaleY;

  // Resize canvas to crop size
  resultCanvas.width = sw;
  resultCanvas.height = sh;

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
});

// Zoom in/out buttons
zoomInBtn.addEventListener('click', () => {
  scale = clamp(scale + 0.2, minScale, maxScale);
  applyScale();
});

zoomOutBtn.addEventListener('click', () => {
  scale = clamp(scale - 0.2, minScale, maxScale);
  applyScale();
});

function applyScale() {
  image.style.width = imgNaturalWidth * scale + 'px';
  image.style.height = imgNaturalHeight * scale + 'px';
  container.style.width = imgNaturalWidth * scale + 'px';
  container.style.height = imgNaturalHeight * scale + 'px';

  if (cropRect) {
    // Scale crop rectangle to new size
    cropRect.x *= scale / (cropRect._prevScale || scale);
    cropRect.y *= scale / (cropRect._prevScale || scale);
    cropRect.width *= scale / (cropRect._prevScale || scale);
    cropRect.height *= scale / (cropRect._prevScale || scale);

    cropRect._prevScale = scale;
    updateCropArea();
  }
}

// Aspect ratio change handler
aspectRatioSelect.addEventListener('change', () => {
  const val = aspectRatioSelect.value;
  if (val === 'free') {
    aspectRatio = null;
  } else {
    const parts = val.split(':');
    aspectRatio = parseInt(parts[0]) / parseInt(parts[1]);
  }

  // If cropRect exists, enforce new aspect ratio immediately
  if (cropRect && aspectRatio) {
    cropRect.height = cropRect.width / aspectRatio;
    updateCropArea();
  }
});

// Pointer events for crop area (supports mouse & touch)
cropArea.addEventListener('pointerdown', onCropAreaPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// Initialize state
cropBtn.disabled = true;
clearCropBtn.disabled = true;
cropArea.style.display = 'none';
