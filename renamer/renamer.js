const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const renameBtn = document.getElementById('rename-btn');
const patternSelect = document.getElementById('sort-order');
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');

let files = [];
let dragSrcEl = null;

// Drag & drop zone handlers
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.background = '#eef';
});
dropZone.addEventListener('dragleave', () => (dropZone.style.background = ''));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.background = '';
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

// Handle incoming files (drop or select)
function handleFiles(fileListInput) {
  files = Array.from(fileListInput);
  applySort(patternSelect.value);
  displayFileList();
}

// Display the list with drag-and-drop for manual order
function displayFileList() {
  fileList.innerHTML = '';

  files.forEach((file, index) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.draggable = patternSelect.value === 'custom';
    row.dataset.index = index;

    row.textContent = file.name;

    // Drag & drop events for manual reorder
    if (row.draggable) {
      row.addEventListener('dragstart', dragStart);
      row.addEventListener('dragover', dragOver);
      row.addEventListener('drop', drop);
      row.addEventListener('dragend', dragEnd);
    }

    fileList.appendChild(row);
  });
}

// Sorting handler
patternSelect.addEventListener('change', () => {
  applySort(patternSelect.value);
  displayFileList();
});

function applySort(method) {
  switch (method) {
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
    case 'id':
      files.sort((a, b) => extractNumber(a.name) - extractNumber(b.name));
      break;
    case 'custom':
    default:
      // Do nothing, keep current order
      break;
  }
}

function extractNumber(filename) {
  // Extract first number found in filename for sorting by ID
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
}

// Drag and drop reorder handlers
function dragStart(e) {
  dragSrcEl = e.target;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.innerHTML);
  e.target.style.opacity = '0.4';
}
function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}
function drop(e) {
  e.stopPropagation();
  if (dragSrcEl !== this) {
    const fromIndex = parseInt(dragSrcEl.dataset.index);
    const toIndex = parseInt(this.dataset.index);

    // Swap files array items
    files.splice(toIndex, 0, files.splice(fromIndex, 1)[0]);

    applySort('custom'); // To update indices after reorder
    displayFileList();
  }
}
function dragEnd(e) {
  e.target.style.opacity = '1';
}

// Rename & Download ZIP handler
renameBtn.addEventListener('click', async () => {
  if (files.length === 0) {
    alert('Please add some files first.');
    return;
  }

  const prefix = prefixInput.value.trim() || 'file';
  let startNumStr = startNumberInput.value.trim();

  // Validate start number
  if (!/^\d+$/.test(startNumStr)) {
    alert('Starting Number must be a number (leading zeros allowed).');
    startNumberInput.focus();
    return;
  }

  // Determine padding from leading zeros
  const padding = startNumStr.length;
  let startNum = parseInt(startNumStr, 10);

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
    // Format number with leading zeros
    const numberStr = String(startNum + i).padStart(padding, '0');
    const newName = ext ? `${prefix}_${numberStr}.${ext}` : `${prefix}_${numberStr}`;

    const content = await file.arrayBuffer();
    zip.file(newName, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'renamed_files.zip';
  a.click();
  URL.revokeObjectURL(url);
});
