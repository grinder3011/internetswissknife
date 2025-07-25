const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const aspectRatioSelect = document.getElementById('aspectRatio');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

const ctx = resultCanvas.getContext('2d');

let imgNaturalWidth, imgNaturalHeight;
let scale = 1;
let isDragging = false;
let dragStartX, dragStartY;

let cropRect = { x: 50, y: 50, width: 100, height: 100 };
let aspectRatio = null;

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    imgNaturalWidth = image.naturalWidth;
    imgNaturalHeight = image.naturalHeight;

    // Reset image scale to fit container
    scale = Math.min(
      800 / imgNaturalWidth,
      500 / imgNaturalHeight,
      1
    );
    image.style.transform = `scale(${scale})`;

    resetCropArea();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
    downloadBtn.disabled = false;
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

// Dragging
cropArea.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  dragStartX = e.clientX;
  dragStartY = e.clientY;

  cropRect.x = Math.min(Math.max(0, cropRect.x + dx), image.width - cropRect.width);
  cropRect.y = Math.min(Math.max(0, cropRect.y + dy), image.height - cropRect.height);

  updateCropArea();
});

// Sync cropRect with native resize changes
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const rect = entry.target.getBoundingClientRect();
    const containerRect = image.getBoundingClientRect();

    cropRect.width = rect.width;
    cropRect.height = rect.height;
    cropRect.x = rect.left - containerRect.left;
    cropRect.y = rect.top - containerRect.top;

    // If aspect ratio is set, adjust height or width
    if (aspectRatio) {
      cropRect.height = cropRect.width / aspectRatio;
      cropArea.style.height = cropRect.height + 'px';
    }

    updateCropArea();
  }
});
resizeObserver.observe(cropArea);

// Crop button
cropBtn.addEventListener('click', () => {
  const scaleX = imgNaturalWidth / (image.width * scale);
  const scaleY = imgNaturalHeight / (image.height * scale);

  const sx = cropRect.x * scaleX;
  const sy = cropRect.y * scaleY;
  const sw = cropRect.width * scaleX;
  const sh = cropRect.height * scaleY;

  resultCanvas.width = cropRect.width;
  resultCanvas.height = cropRect.height;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropRect.width, cropRect.height);
});

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  scale = Math.min(scale + 0.1, 3);
  image.style.transform = `scale(${scale})`;
});

zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(scale - 0.1, 0.2);
  image.style.transform = `scale(${scale})`;
});

// Aspect ratio
aspectRatioSelect.addEventListener('change', () => {
  const val = aspectRatioSelect.value;
  if (val === 'free') {
    aspectRatio = null;
  } else {
    const [w, h] = val.split(':').map(Number);
    aspectRatio = w / h;

    cropRect.height = cropRect.width / aspectRatio;
    updateCropArea();
  }
});

// Download cropped image
downloadBtn.addEventListener('click', () => {
  resultCanvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cropped.png';
    a.click();
  }, 'image/png');
});
