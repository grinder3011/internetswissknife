const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const downloadBtn = document.createElement('button');
downloadBtn.textContent = 'Download Cropped Image';
downloadBtn.disabled = true;
document.body.appendChild(downloadBtn);

let imgNaturalWidth, imgNaturalHeight;
let displayedWidth, displayedHeight;
let zoomLevel = 1;

let isDragging = false;
let dragStartX, dragStartY;
let cropRect = { x: 50, y: 50, width: 150, height: 150 };

let uploadedFileType = 'image/png'; // default fallback

// Function to fit image inside container
function fitImageToContainer() {
  const container = document.querySelector('.cropper-container');
  const maxWidth = container.clientWidth;
  const maxHeight = container.clientHeight;

  let width = imgNaturalWidth;
  let height = imgNaturalHeight;

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scale = Math.min(widthRatio, heightRatio, 1); // don't upscale

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

    // Fit image inside container and get displayed size
    fitImageToContainer();

    // Set image width and height properties accordingly
    image.width = displayedWidth;
    image.height = displayedHeight;

    resetCropArea();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
    downloadBtn.disabled = true; // reset download on new image
  };
});

// Drag crop area
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

  cropRect.x = clamp(cropRect.x + dx, 0, displayedWidth - cropRect.width);
  cropRect.y = clamp(cropRect.y + dy, 0, displayedHeight - cropRect.height);

  updateCropArea();
});

// Zoom handling (mouse wheel)
document.querySelector('.cropper-container').addEventListener('wheel', e => {
  e.preventDefault();

  const zoomStep = 0.1;
  const minZoom = 0.1;
  const maxZoom = 3;

  if (e.deltaY < 0) {
    zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
  } else {
    zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
  }

  applyZoom();

  // After zoom, clamp cropRect to new image size
  cropRect.x = clamp(cropRect.x, 0, displayedWidth * zoomLevel - cropRect.width);
  cropRect.y = clamp(cropRect.y, 0, displayedHeight * zoomLevel - cropRect.height);
  updateCropArea();
}, { passive: false });

function applyZoom() {
  image.style.transform = `scale(${zoomLevel})`;
  cropArea.style.transform = `scale(${zoomLevel})`;

  // To keep cropArea positioned correctly after scaling:
  cropArea.style.transformOrigin = 'top left';
  image.style.transformOrigin = 'top left';
}

// Crop button click
cropBtn.addEventListener('click', () => {
  // Calculate scale between displayed image (after zoom) and natural size
  const scaleX = imgNaturalWidth / (displayedWidth * zoomLevel);
  const scaleY = imgNaturalHeight / (displayedHeight * zoomLevel);

  // Calculate cropping area in natural image coordinates
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

// Download cropped image button
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'cropped.' + uploadedFileType.split('/')[1];
  link.href = resultCanvas.toDataURL(uploadedFileType);
  link.click();
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

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
