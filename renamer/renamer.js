const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const renameBtn = document.getElementById('rename-btn');
const prefixInput = document.getElementById('prefix');
const startInput = document.getElementById('start-number');
const paddingInput = document.getElementById('padding');
const sortOrder = document.getElementById('sort-order');

let files = [];
let dragSrcIndex = null;

// --- File Handling Events ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));
sortOrder.addEventListener('change', displayFileList);
[prefixInput, startInput, paddingInput].forEach(input =>
  input.addEventListener('input', displayFileList)
);

// --- Utility Functions ---
function handleFiles(fileListInput) {
  files = Array.from(fileListInput);
  displayFileList();
}

function getNewName(index, ext) {
  const prefix = prefixInput.value || "file";
  const start = parseInt(startInput.value) || 1;
  const padding = parseInt(paddingInput.value) || 1;
  const number = String(index + start).padStart(padding, '0');
  return `${prefix}_${number}.${ext}`;
}

function sortFiles() {
  const sortValue = sortOrder.value;
  if (sortValue === 'custom') return;

  files.sort((a, b) => {
    switch (sortValue) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'date-asc': return a.lastModified - b.lastModified;
      case 'date-desc': return b.lastModified - a.lastModified;
      default: return 0;
    }
  });
}

function reorderFiles(from, to) {
  const moved = files.splice(from, 1)[0];
  files.splice(to, 0, moved);
}

// --- Display & Dragging ---
function displayFileList() {
  sortFiles();
  fileList.innerHTML = '';

  files.forEach((file, index) => {
    const ext = file.name.split('.').pop();
    const newName = getNewName(index, ext);

    const item = document.createElement('div');
    item.className = 'file-item';
    item.draggable = true;
    item.dataset.index = index;
    item.innerHTML = `<span>${file.name}</span> → <strong>${newName}</strong>`;

    item.addEventListener('dragstart', () => {
      dragSrcIndex = parseInt(item.dataset.index);
      item.classList.add('dragging');
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
      item.style.background = '#eaf3ff';
    });

    item.addEventListener('dragleave', () => {
      item.style.background = '';
    });

    item.addEventListener('drop', () => {
      const dropIndex = parseInt(item.dataset.index);
      reorderFiles(dragSrcIndex, dropIndex);
      displayFileList();
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      item.style.background = '';
    });

    fileList.appendChild(item);
  });
}

// --- Download ZIP ---
renameBtn.addEventListener('click', async () => {
  if (files.length === 0) {
    alert("Please upload some files first.");
    return;
  }

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop();
    const newName = getNewName(i, ext);
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
