const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileListContainer = document.getElementById('file-list');
const sortOrderSelect = document.getElementById('sort-order');
const renameBtn = document.getElementById('rename-btn');
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');
const paddingInput = document.getElementById('padding');

let files = [];
let manualOrder = []; // store manual order of files for "custom" sorting

// Helper: extract leading number from filename for "Sort by ID"
function extractLeadingNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity; // Infinity puts non-number files at end
}

// Sort files based on criteria
function sortFiles(criteria) {
  switch(criteria) {
    case 'name-asc':
      files.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      files.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'date-asc':
      files.sort((a, b) => a.lastModified - b.lastModified);
      break;
    case 'date-desc':
      files.sort((a, b) => b.lastModified - a.lastModified);
      break;
    case 'id-asc':
      files.sort((a, b) => extractLeadingNumber(a.name) - extractLeadingNumber(b.name));
      break;
    case 'custom':
    default:
      // Restore manual order
      if (manualOrder.length === files.length) {
        files = manualOrder.map(i => files[i]);
      }
  }
}

// Render file list with drag & drop reorder for "custom" sorting
function renderFileList() {
  fileListContainer.innerHTML = '';

  files.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.draggable = sortOrderSelect.value === 'custom';
    div.dataset.index = index;
    div.textContent = file.name;

    if (div.draggable) {
      div.addEventListener('dragstart', dragStart);
      div.addEventListener('dragover', dragOver);
      div.addEventListener('drop', drop);
      div.addEventListener('dragend', dragEnd);
    }

    fileListContainer.appendChild(div);
  });
}

// Drag and Drop handlers for manual reorder
let dragSrcIndex = null;

function dragStart(e) {
  dragSrcIndex = +this.dataset.index;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
  this.style.opacity = '0.5';
}

function dragOver(e) {
  e.preventDefault();
  this.style.borderTop = e.clientY < this.getBoundingClientRect().top + this.offsetHeight / 2 ? '2px solid blue' : '';
  this.style.borderBottom = e.clientY >= this.getBoundingClientRect().top + this.offsetHeight / 2 ? '2px solid blue' : '';
}

function drop(e) {
  e.preventDefault();
  this.style.borderTop = '';
  this.style.borderBottom = '';
  const dropIndex = +this.dataset.index;

  if (dragSrcIndex !== null && dropIndex !== dragSrcIndex) {
    const draggedFile = files[dragSrcIndex];
    files.splice(dragSrcIndex, 1);
    files.splice(dropIndex, 0, draggedFile);

    // Update manual order indexes
    manualOrder = files.map((_, i) => i);

    renderFileList();
  }
}

function dragEnd(e) {
  this.style.opacity = '1';
  fileListContainer.querySelectorAll('.file-item').forEach(el => {
    el.style.borderTop = '';
    el.style.borderBottom = '';
  });
}

function updateManualOrder() {
  manualOrder = files.map((_, i) => i);
}

// Load files from input or drop
function handleFiles(selectedFiles) {
  files = Array.from(selectedFiles);
  updateManualOrder();

  applySortAndRender();
}

// Apply sort based on dropdown and render list
function applySortAndRender() {
  const sortCriteria = sortOrderSelect.value;
  sortFiles(sortCriteria);
  if(sortCriteria !== 'custom') updateManualOrder(); // reset manual order on sort
  renderFileList();
}

// Format number with leading zeros according to padding
function formatNumber(num, padding) {
  return num.toString().padStart(padding, '0');
}

// Rename and download files as ZIP
async function renameAndDownload() {
  if (files.length === 0) {
    alert('Please select files first.');
    return;
  }

  const prefix = prefixInput.value.trim() || 'file';
  let startNumStr = startNumberInput.value.trim() || '1';
  const padding = parseInt(paddingInput.value, 10) || 0;

  // Parse start number from string pattern (e.g. "0067" -> 67, padding = 4)
  const leadingZerosMatch = startNumStr.match(/^0+/);
  let autoPadding = padding;
  if (leadingZerosMatch) {
    autoPadding = Math.max(padding, leadingZerosMatch[0].length);
  }
  let startNum = parseInt(startNumStr, 10);
  if (isNaN(startNum)) startNum = 1;

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
    const numStr = formatNumber(startNum + i, autoPadding);
    const newName = `${prefix}${numStr}${ext}`;
    const content = await file.arrayBuffer();
    zip.file(newName, content);
  }

  zip.generateAsync({ type: 'blob' }).then(function(content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${prefix}_renamed_files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

// Event listeners

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

sortOrderSelect.addEventListener('change', () => {
  applySortAndRender();
});

renameBtn.addEventListener('click', renameAndDownload);
