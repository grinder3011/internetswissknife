const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');

const drawCropBtn = document.getElementById('drawCropBtn');
const clearCropBtn = document.getElementById('clearCropBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const aspectRatioSelect = document.getElementById('aspectRatioSelect');

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
      // Height changes, width changes accordingly
      width = height * aspectRatio;
      if (resizeHandle === 'n') {
        x = cropRect.x + (cropRect.width - width) / 2;
      }
    } else if (['e','w'].includes(resizeHandle)) {
      // Width changes, height changes accordingly
      height = width / aspectRatio;
      if (resizeHandle === 'w') {
        y = cropRect.y + (cropRect.height - height) / 2;
      }
    } else {
      // Corner handles: keep aspect ratio by adjusting height according to width or vice versa
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
    // Drawing new crop rectangle
    e.preventDefault();
    const pos = getRelativePos(e);
    let x = Math.min(pos.x, dragStartX);
    let y = Math.min(pos.y, dragStartY);
    let width = Math.abs(pos.x - dragStartX);
    let height = Math.abs(pos.y - dragStartY);

    // Lock aspect ratio if set
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    // Clamp to image bounds
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

    // Clamp position inside image
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
  if (isDrawing) {
    // Finished drawing new crop rectangle
    if (cropRect && (cropRect.width < 10 || cropRect.height < 10)) {
      clearCropArea(); // too small, discard
    }
    isDrawing = false;
    cropArea.style.pointerEvents = 'auto';
    drawCropBtn.textContent = "Draw new crop area";
    cropBtn.disabled = !cropRect;
    clearCropBtn.disabled = !cropRect;
  }

  isDragging = false;
  isResizing = false;
  resizeHandle = null;
}

// Zoom functions
function zoom(factor) {
  const newScale = clamp(scale * factor, minScale, maxScale);
  if (newScale === scale) return;
  scale = newScale;

  // Resize image element to zoom
  image.style.width = (imgNaturalWidth * scale) + 'px';
  image.style.height = (imgNaturalHeight * scale) + 'px';

  // Adjust crop rect to scale
  if (cropRect) {
    cropRect.x *= factor;
    cropRect.y *= factor;
    cropRect.width *= factor;
    cropRect.height *= factor;

    // Clamp inside image
    cropRect.x = clamp(cropRect.x, 0, image.width - cropRect.width);
    cropRect.y = clamp(cropRect.y, 0, image.height - cropRect.height);

    updateCropArea();
  }
}

// Crop image
cropBtn.addEventListener('click', () => {
  if (!cropRect) return;

  const scaleX = imgNaturalWidth / image.width;
  const scaleY = imgNaturalHeight / image.height;

  const sx = cropRect.x * scaleX;
  const sy = cropRect.y * scaleY;
  const sw = cropRect.width * scaleX;
  const sh = cropRect.height * scaleY;

  resultCanvas.width = cropRect.width;
  resultCanvas.height = cropRect.height;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropRect.width, cropRect.height);
});

// Draw new crop area toggle
drawCropBtn.addEventListener('click', () => {
  if (isDrawing) {
    // Turn off draw mode
    isDrawing = false;
    cropArea.style.pointerEvents = 'auto';
    drawCropBtn.textContent = "Draw new crop area";
  } else {
    // Turn on draw mode
    isDrawing = true;
    cropArea.style.pointerEvents = 'none'; // disable normal cropArea interaction
    drawCropBtn.textContent = "Cancel drawing";
    clearCropArea();
  }
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
});

// Clear crop area button
clearCropBtn.addEventListener('click', () => {
  clearCropArea();
  cropBtn.disabled = true;
  clearCropBtn.disabled = true;
});

// Zoom buttons
zoomInBtn.addEventListener('click', () => zoom(1.2));
zoomOutBtn.addEventListener('click', () => zoom(1 / 1.2));

// Aspect ratio select
aspectRatioSelect.addEventListener('change', () => {
  const val = aspectRatioSelect.value;
  if (val === 'free') {
    aspectRatio = null;
  } else {
    aspectRatio = eval(val); // convert string "4/5" etc to number
  }
  // When aspect ratio changes, adjust current crop rectangle accordingly
  if (cropRect && aspectRatio) {
    let newWidth = cropRect.width;
    let newHeight = cropRect.height;

    if (cropRect.width / cropRect.height > aspectRatio) {
      newWidth = cropRect.height * aspectRatio;
    } else {
      newHeight = cropRect.width / aspectRatio;
    }

    cropRect.width = newWidth;
    cropRect.height = newHeight;

    updateCropArea();
  }
});

// Image upload and initial setup
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    imgNaturalWidth = image.naturalWidth;
    imgNaturalHeight = image.naturalHeight;
    scale = 1;

    // Fit image inside container max dimensions
    const containerMaxWidth = container.clientWidth;
    const containerMaxHeight = container.clientHeight;

    let width = imgNaturalWidth;
    let height = imgNaturalHeight;

    // Scale down if bigger than container
    const widthRatio = containerMaxWidth / width;
    const heightRatio = containerMaxHeight / height;
    const minRatio = Math.min(widthRatio, heightRatio, 1);

    width *= minRatio;
    height *= minRatio;
    scale = width / imgNaturalWidth;

    image.style.width = width + 'px';
    image.style.height = height + 'px';

    resetCropArea();

    cropBtn.disabled = false;
    clearCropBtn.disabled = false;
  };
});

// Pointer events for desktop and touch devices on container for drawing
container.addEventListener('pointerdown', e => {
  if (!isDrawing) return;
  e.preventDefault();
  const pos = getRelativePos(e);
  dragStartX = pos.x;
  dragStartY = pos.y;

  cropRect = null;
  updateCropArea();
  cropArea.style.display = 'block';
});

container.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// Crop area pointer events (move and resize)
cropArea.addEventListener('pointerdown', onCropAreaPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// Mouse wheel zoom
container.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  zoom(zoomFactor);
}, { passive: false });
