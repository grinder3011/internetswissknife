const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const cropArea = document.getElementById('cropArea');
const cropBtn = document.getElementById('cropBtn');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');

let imgNaturalWidth, imgNaturalHeight;
let isDragging = false;
let dragStartX, dragStartY;
let cropRect = { x: 0, y: 0, width: 100, height: 100 };

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  image.src = url;

  image.onload = () => {
    imgNaturalWidth = image.naturalWidth;
    imgNaturalHeight = image.naturalHeight;
    resetCropArea();
    cropArea.style.display = 'block';
    cropBtn.disabled = false;
  };
});

function resetCropArea() {
  cropRect = { x: 50, y: 50, width: 100, height: 100 };
  updateCropArea();
}

function updateCropArea() {
  cropArea.style.left = cropRect.x + 'px';
  cropArea.style.top = cropRect.y + 'px';
  cropArea.style.width = cropRect.width + 'px';
  cropArea.style.height = cropRect.height + 'px';
}

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

  cropRect.x = Math.min(Math.max(0, cropRect.x + dx), image.width - cropRect.width);
  cropRect.y = Math.min(Math.max(0, cropRect.y + dy), image.height - cropRect.height);

  updateCropArea();
});

// Crop button click
cropBtn.addEventListener('click', () => {
  // Calculate scale between displayed image and natural size
  const scaleX = imgNaturalWidth / image.width;
  const scaleY = imgNaturalHeight / image.height;

  // Calculate cropping area in natural image coordinates
  const sx = cropRect.x * scaleX;
  const sy = cropRect.y * scaleY;
  const sw = cropRect.width * scaleX;
  const sh = cropRect.height * scaleY;

  resultCanvas.width = cropRect.width;
  resultCanvas.height = cropRect.height;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, cropRect.width, cropRect.height);
});
