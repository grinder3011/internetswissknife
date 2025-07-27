(() => {
  const imageInput = document.getElementById('imageInput');
  const image = document.getElementById('image');
  const cropArea = document.getElementById('cropArea');
  const cropperContainer = document.getElementById('cropperContainer');
  const drawCropBtn = document.getElementById('drawCropBtn');
  const clearCropBtn = document.getElementById('clearCropBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const aspectRatioSelect = document.getElementById('aspectRatioSelect');
  const cropBtn = document.getElementById('cropBtn');
  const resultContainer = document.getElementById('resultContainer');
  const resultCanvas = document.getElementById('resultCanvas');
  const ctx = resultCanvas.getContext('2d');

  let imgNaturalWidth, imgNaturalHeight;
  let scale = 1;
  const scaleStep = 0.1;
  const scaleMin = 0.2;
  const scaleMax = 5;

  let isDraggingImage = false;
  let dragStart = { x: 0, y: 0 };
  let imagePos = { x: 0, y: 0 };

  let isDrawingCrop = false;
  let cropStart = { x: 0, y: 0 };
  let cropRect = { left: 0, top: 0, width: 0, height: 0 };

  let isMovingCrop = false;
  let moveStart = { x: 0, y: 0 };

  let aspectRatio = null; // null means free aspect

  // Enable/disable controls helper
  function setControlsEnabled(enabled) {
    drawCropBtn.disabled = !enabled;
    zoomInBtn.disabled = !enabled;
    zoomOutBtn.disabled = !enabled;
    aspectRatioSelect.disabled = !enabled;
    cropBtn.disabled = !enabled;
    clearCropBtn.disabled = !enabled;
  }

  // Reset crop area UI
  function resetCropArea() {
    cropArea.style.display = 'none';
    cropRect = { left: 0, top: 0, width: 0, height: 0 };
    clearCropBtn.disabled = true;
    cropBtn.disabled = true;
  }

  // Update crop area UI from cropRect
  function updateCropArea() {
    cropArea.style.left = cropRect.left + 'px';
    cropArea.style.top = cropRect.top + 'px';
    cropArea.style.width = cropRect.width + 'px';
    cropArea.style.height = cropRect.height + 'px';
  }

  // Clamp value between min and max
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // Convert container pixel coords to image pixel coords (accounting for scale and image pos)
  function containerToImageCoords(containerX, containerY) {
    const containerRect = cropperContainer.getBoundingClientRect();

    // relative coords inside container
    let relX = containerX - containerRect.left;
    let relY = containerY - containerRect.top;

    // adjust for image position & scale
    const imgLeft = imagePos.x + containerRect.width / 2 - (imgNaturalWidth * scale) / 2;
    const imgTop = imagePos.y + containerRect.height / 2 - (imgNaturalHeight * scale) / 2;

    const imgX = (relX - imgLeft) / scale;
    const imgY = (relY - imgTop) / scale;

    return { x: imgX, y: imgY };
  }

  // Convert image pixel coords to container coords
  function imageToContainerCoords(imgX, imgY) {
    const containerRect = cropperContainer.getBoundingClientRect();

    const imgLeft = imagePos.x + containerRect.width / 2 - (imgNaturalWidth * scale) / 2;
    const imgTop = imagePos.y + containerRect.height / 2 - (imgNaturalHeight * scale) / 2;

    const contX = imgLeft + imgX * scale;
    const contY = imgTop + imgY * scale;
    return { x: contX, y: contY };
  }

  // Load image from input
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    image.src = url;

    image.onload = () => {
      imgNaturalWidth = image.naturalWidth;
      imgNaturalHeight = image.naturalHeight;
      scale = 1;
      imagePos = { x: 0, y: 0 };
      updateImageTransform();
      resetCropArea();
      setControlsEnabled(true);
      resultContainer.style.display = 'none';
    };
  });

  // Update image CSS transform based on position and scale
  function updateImageTransform() {
    image.style.transform = `translate(calc(-50% + ${imagePos.x}px), calc(-50% + ${imagePos.y}px)) scale(${scale})`;
  }

  // Zoom In/Out buttons
  zoomInBtn.addEventListener('click', () => {
    scale = clamp(scale + scaleStep, scaleMin, scaleMax);
    updateImageTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = clamp(scale - scaleStep, scaleMin, scaleMax);
    updateImageTransform();
  });

  // Dragging the image around inside container
  image.addEventListener('mousedown', (e) => {
    if (isDrawingCrop) return; // don't drag while drawing crop
    e.preventDefault();
    isDraggingImage = true;
    dragStart = { x: e.clientX, y: e.clientY };
    image.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    isDraggingImage = false;
    image.style.cursor = 'grab';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingImage) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragStart = { x: e.clientX, y: e.clientY };
    imagePos.x += dx;
    imagePos.y += dy;
    updateImageTransform();
  });

  // Draw crop button activates drawing mode
  drawCropBtn.addEventListener('click', () => {
    resetCropArea();
    isDrawingCrop = true;
    cropArea.style.display = 'none';
    clearCropBtn.disabled = true;
    cropBtn.disabled = true;
  });

  // Clear crop button
  clearCropBtn.addEventListener('click', () => {
    resetCropArea();
  });

  // Aspect ratio change handler
  aspectRatioSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'free') {
      aspectRatio = null;
    } else {
      // parse ratio string like "4/5"
      if (val.includes('/')) {
        const parts = val.split('/');
        aspectRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        aspectRatio = parseFloat(val);
      }
    }

    // If crop area visible, adjust current crop size to new aspect ratio
    if (cropArea.style.display === 'block' && aspectRatio) {
      let w = cropRect.width;
      let h = cropRect.height;
      let centerX = cropRect.left + w / 2;
      let centerY = cropRect.top + h / 2;

      if (w / h > aspectRatio) {
        w = h * aspectRatio;
      } else {
        h = w / aspectRatio;
      }

      cropRect.width = w;
      cropRect.height = h;
      cropRect.left = centerX - w / 2;
      cropRect.top = centerY - h / 2;

      constrainCropRect();
      updateCropArea();
    }
  });

  // Constrain cropRect to stay inside the image visible area
  function constrainCropRect() {
    const containerRect = cropperContainer.getBoundingClientRect();

    // Compute image visible rectangle in container coords
    const imgLeft = imagePos.x + containerRect.width / 2 - (imgNaturalWidth * scale) / 2;
    const imgTop = imagePos.y + containerRect.height / 2 - (imgNaturalHeight * scale) / 2;
    const imgRight = imgLeft + imgNaturalWidth * scale;
    const imgBottom = imgTop + imgNaturalHeight * scale;

    // Clamp left and top
    if (cropRect.left < imgLeft) cropRect.left = imgLeft;
    if (cropRect.top < imgTop) cropRect.top = imgTop;

    // Clamp width and height
    if (cropRect.left + cropRect.width > imgRight) cropRect.width = imgRight - cropRect.left;
    if (cropRect.top + cropRect.height > imgBottom) cropRect.height = imgBottom - cropRect.top;
  }

  // Mouse events for drawing crop area inside container
  cropperContainer.addEventListener('mousedown', (e) => {
    if (!isDrawingCrop) return;

    e.preventDefault();

    const containerRect = cropperContainer.getBoundingClientRect();
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;

    cropStart = { x: startX, y: startY };
    cropRect = { left: startX, top: startY, width: 0, height: 0 };

    cropArea.style.display = 'block';
    updateCropArea();

    function onMouseMove(event) {
      const moveX = event.clientX - containerRect.left;
      const moveY = event.clientY - containerRect.top;

      let w = moveX - cropStart.x;
      let h = moveY - cropStart.y;

      // Handle aspect ratio
      if (aspectRatio) {
        if (Math.abs(w) > Math.abs(h)) {
          h = Math.sign(h) * Math.abs(w) / aspectRatio;
        } else {
          w = Math.sign(w) * Math.abs(h) * aspectRatio;
        }
      }

      cropRect.left = w < 0 ? cropStart.x + w : cropStart.x;
      cropRect.top = h < 0 ? cropStart.y + h : cropStart.y;
      cropRect.width = Math.abs(w);
      cropRect.height = Math.abs(h);

      constrainCropRect();
      updateCropArea();
    }

    function onMouseUp() {
      isDrawingCrop = false;
      clearCropBtn.disabled = false;
      cropBtn.disabled = false;

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  // Move crop area dragging
  cropArea.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isMovingCrop = true;
    moveStart = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => {
    isMovingCrop = false;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isMovingCrop) return;

    e.preventDefault();

    const dx = e.clientX - moveStart.x;
    const dy = e.clientY - moveStart.y;
    moveStart = { x: e.clientX, y: e.clientY };

    cropRect.left += dx;
    cropRect.top += dy;

    constrainCropRect();
    updateCropArea();
  });

  // Crop button event - crops image to cropRect and draws result on canvas
  cropBtn.addEventListener('click', () => {
    if (cropRect.width === 0 || cropRect.height === 0) return;

    const containerRect = cropperContainer.getBoundingClientRect();

    // Convert cropRect container coordinates to image coordinates
    const imgLeft = imagePos.x + containerRect.width / 2 - (imgNaturalWidth * scale) / 2;
    const imgTop = imagePos.y + containerRect.height / 2 - (imgNaturalHeight * scale) / 2;

    const cropLeft = (cropRect.left - imgLeft) / scale;
    const cropTop = (cropRect.top - imgTop) / scale;
    const cropWidth = cropRect.width / scale;
    const cropHeight = cropRect.height / scale;

    // Create canvas with crop dimensions
    resultCanvas.width = cropWidth;
    resultCanvas.height = cropHeight;

    // Draw cropped area
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    ctx.drawImage(
      image,
      cropLeft, cropTop, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    resultContainer.style.display = 'block';
  });
})();
