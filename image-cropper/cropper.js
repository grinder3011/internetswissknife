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
const resultContainer = document.getElementById('resultContainer');

// ✅ Add new elements for download
const downloadBtn = document.createElement('button');
downloadBtn.textContent = 'Download';
downloadBtn.id = 'downloadBtn';
downloadBtn.disabled = true;

const formatSelect = document.createElement('select');
formatSelect.id = 'downloadFormatSelect';
['png', 'jpeg', 'webp'].forEach(fmt => {
    const opt = document.createElement('option');
    opt.value = fmt;
    opt.textContent = fmt.toUpperCase();
    formatSelect.appendChild(opt);
});

document.querySelector('main').appendChild(downloadBtn);
document.querySelector('main').appendChild(formatSelect);

// State variables
let cropStartX = 0;
let cropStartY = 0;
let cropWidth = 0;
let cropHeight = 0;
let isDrawing = false;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentScale = 1;

// ✅ Load image
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            cropArea.style.display = 'none';
            cropBtn.disabled = true;
            clearCropBtn.disabled = true;
            downloadBtn.disabled = true;
        };
        reader.readAsDataURL(file);
    }
});

// ✅ Enable drawing crop area
drawCropBtn.addEventListener('click', () => {
    cropArea.style.display = 'none';
    cropBtn.disabled = true;
    clearCropBtn.disabled = true;
    isDrawing = false;
});

// ✅ Start drawing crop
image.addEventListener('mousedown', startDraw);
image.addEventListener('touchstart', startDraw, { passive: false });

function startDraw(e) {
    if (e.type === 'touchstart') e.preventDefault();
    const pos = getMousePosition(e);
    cropStartX = pos.x;
    cropStartY = pos.y;
    isDrawing = true;
    cropArea.style.display = 'block';
}

image.addEventListener('mousemove', drawCrop);
image.addEventListener('touchmove', drawCrop, { passive: false });

function drawCrop(e) {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const pos = getMousePosition(e);
    cropWidth = pos.x - cropStartX;
    cropHeight = pos.y - cropStartY;

    if (cropWidth < 0) {
        cropArea.style.left = pos.x + 'px';
        cropArea.style.width = Math.abs(cropWidth) + 'px';
    } else {
        cropArea.style.left = cropStartX + 'px';
        cropArea.style.width = cropWidth + 'px';
    }

    if (cropHeight < 0) {
        cropArea.style.top = pos.y + 'px';
        cropArea.style.height = Math.abs(cropHeight) + 'px';
    } else {
        cropArea.style.top = cropStartY + 'px';
        cropArea.style.height = cropHeight + 'px';
    }
}

image.addEventListener('mouseup', endDraw);
image.addEventListener('touchend', endDraw);

function endDraw() {
    if (isDrawing) {
        isDrawing = false;
        cropBtn.disabled = false;
        clearCropBtn.disabled = false;
    }
}

// ✅ Drag crop area
cropArea.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    const pos = getMousePosition(e);
    dragOffsetX = pos.x - cropArea.offsetLeft;
    dragOffsetY = pos.y - cropArea.offsetTop;
});

cropArea.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    const pos = getMousePosition(e);
    dragOffsetX = pos.x - cropArea.offsetLeft;
    dragOffsetY = pos.y - cropArea.offsetTop;
}, { passive: false });

document.addEventListener('mousemove', dragCropArea);
document.addEventListener('touchmove', dragCropArea, { passive: false });

function dragCropArea(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();
    const pos = getMousePosition(e);
    cropArea.style.left = (pos.x - dragOffsetX) + 'px';
    cropArea.style.top = (pos.y - dragOffsetY) + 'px';
}

document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('touchend', () => isDragging = false);

// ✅ Clear crop
clearCropBtn.addEventListener('click', () => {
    cropArea.style.display = 'none';
    cropBtn.disabled = true;
    clearCropBtn.disabled = true;
});

// ✅ Crop image
cropBtn.addEventListener('click', () => {
    const rect = cropArea.getBoundingClientRect();
    const imgRect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / imgRect.width;
    const scaleY = image.naturalHeight / imgRect.height;

    const x = (rect.left - imgRect.left) * scaleX;
    const y = (rect.top - imgRect.top) * scaleY;
    const width = rect.width * scaleX;
    const height = rect.height * scaleY;

    resultCanvas.width = width;
    resultCanvas.height = height;
    const ctx = resultCanvas.getContext('2d');
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    downloadBtn.disabled = false;
});

// ✅ Download cropped image
downloadBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    const link = document.createElement('a');
    link.download = `cropped.${format}`;
    link.href = resultCanvas.toDataURL(`image/${format}`);
    link.click();
});

// ✅ Zoom functionality
zoomInBtn.addEventListener('click', () => {
    currentScale += 0.1;
    image.style.transform = `scale(${currentScale})`;
});

zoomOutBtn.addEventListener('click', () => {
    if (currentScale > 0.2) {
        currentScale -= 0.1;
        image.style.transform = `scale(${currentScale})`;
    }
});

// ✅ Helper for mouse/touch position
function getMousePosition(e) {
    const rect = image.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}
