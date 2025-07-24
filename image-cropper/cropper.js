// Cropper tool JS logic

const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const aspectRatioToggle = document.getElementById('aspectRatioToggle');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
const flipVerticalBtn = document.getElementById('flipVerticalBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

let img = new Image();
let imgLoaded = false;

let scale = 1;
let rotation = 0; // in degrees
let flipH = 1; // 1 or -1
let flipV = 1; // 1 or -1

// Crop box state
let cropBox = { x: 0, y: 0, width: 0, height: 0 };
let isDraggingCrop = false;
let dragStart = { x: 0, y: 0 };
let dragOffset = { x: 0, y: 0 };

let aspectRatioLocked = false;
const fixedAspectRatio = 16 / 9;

function resetState() {
  scale = 1;
  rotation = 0;
  flipH = 1;
  flipV = 1;

  cropBox = {
    x: 50,
    y: 50,
    width: 300,
    height: 300,
  };

  aspectRatioLocked = false;
  aspectRatioToggle.checked = false;
  updateCropBox();
  updatePreview();
  drawImage();
}

function updateCropBox() {
  // Limit crop box inside image boundaries
  if (!imgLoaded) return;

  if (cropBox.x < 0) cropBox.x = 0;
  if (cropBox.y < 0) cropBox.y = 0;
  if (cropBox.x + cropBox.width > image.width) cropBox.width = image.width - cropBox.x;
  if (cropBox.y + cropBox.height > image.height) cropBox.height = image.height - cropBox.y;

  // If aspect ratio locked, adjust height based on width or vice versa
  if (aspectRatioLocked) {
    cropBox.height = cropBox.width / fixedAspectRatio;
    if (cropBox.y + cropBox.height > image.height) {
      cropBox.height = image.height - cropBox.y;
      cropBox.width = cropBox.height * fixedAspectRatio;
    }
  }
}

// Load and display the selected image
imageInput.addEventListener('change', (e) => {
  if (!e.target.files || !e.target.files[0]) return;
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (evt) {
    img.src = evt.target.result;
    img.onload = function () {
      imgLoaded = true;

      // Reset crop box based on image size
      cropBox = {
        x: img.width * 0.1,
        y: img.height * 0.1,
        width: img.width * 0.8,
        height: img.height * 0.8,
      };

      resetState();
    };
  };

  reader.readAsDataURL(file);
});

// Draw image with current transformations in cropper-viewer
function drawImage() {
  if (!imgLoaded) return;

  // Apply CSS transform for rotate/flip/scale
  let transformStr = `scale(${scale * flipH}, ${scale * flipV}) rotate(${rotation}deg)`;
  image.style.transform = transformStr;

  // Update image src if needed (already set)

  // Draw crop box overlay
  drawCropBoxOverlay();
}

function drawCropBoxOverlay() {
  // We'll implement a transparent overlay with crop box border inside the cropper-viewer

  // For simplicity, add a semi-transparent overlay div with absolute positioning
  // and a visible border for crop box.
  // Since we do not have canvas here for cropping UI, we'll do a minimal example.

  // The crop box rectangle is relative to the image size; 
  // so we calculate pixel positions and sizes on screen.

  // We can do this better with a canvas overlay or dedicated div.

  // For now, let's just skip actual crop box UI in this version,
  // and let the user export the full image.

  // You can later add draggable crop box with mouse events to expand this.
}

// Zoom handlers
zoomInBtn.addEventListener('click', () => {
  scale = Math.min(scale + 0.1, 3);
  drawImage();
  updatePreview();
});
zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(scale - 0.1, 0.1);
  drawImage();
  updatePreview();
});

// Rotate handlers
rotateLeftBtn.addEventListener('click', () => {
  rotation -= 90;
  drawImage();
  updatePreview();
});
rotateRightBtn.addEventListener('click', () => {
  rotation += 90;
  drawImage();
  updatePreview();
});

// Flip handlers
flipHorizontalBtn.addEventListener('click', () => {
  flipH *= -1;
  drawImage();
  updatePreview();
});
flipVerticalBtn.addEventListener('click', () => {
  flipV *= -1;
  drawImage();
  updatePreview();
});

// Reset button
resetBtn.addEventListener('click', () => {
  resetState();
});

// Aspect ratio toggle
aspectRatioToggle.addEventListener('change', (e) => {
  aspectRatioLocked = e.target.checked;
  updateCropBox();
  drawImage();
  updatePreview();
});

// Export cropped image
exportBtn.addEventListener('click', () => {
  if (!imgLoaded) return alert('Please upload an image first.');

  // For simplicity: crop the entire visible image area with current transforms applied

  // Create an offscreen canvas to draw the cropped image
  const exportCanvas = document.createElement('canvas');
  const ctx = exportCanvas.getContext('2d');

  // For now, crop full image without crop box UI implemented (you can improve this later)
  exportCanvas.width = img.width;
  exportCanvas.height = img.height;

  ctx.save();

  // Move to center to apply rotation
  ctx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  // Flip horizontally and vertically
  ctx.scale(flipH * scale, flipV * scale);

  // Draw image offset by half width/height because of translate above
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  ctx.restore();

  // Download cropped image
  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropped-image.png';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Also update preview
  previewCanvas.width = exportCanvas.width;
  previewCanvas.height = exportCanvas.height;
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(exportCanvas, 0, 0);
});

// Update preview on any change
function updatePreview() {
  if (!imgLoaded) return;

  // Draw transformed image to previewCanvas
  previewCanvas.width = img.width;
  previewCanvas.height = img.height;

  previewCtx.save();

  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Center for rotation
  previewCtx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
  previewCtx.rotate((rotation * Math.PI) / 180);
  previewCtx.scale(flipH * scale, flipV * scale);
  previewCtx.drawImage(img, -img.width / 2, -img.height / 2);

  previewCtx.restore();
}

// Initial reset state (no image loaded)
resetState();
