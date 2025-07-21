const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileListElement = document.getElementById('file-list');
const renameBtn = document.getElementById('rename-btn');
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');
const underscoreCheckbox = document.getElementById('use-underscore');
const previewElement = document.getElementById('preview-filename');
const sortOrderSelect = document.getElementById('sort-order');

let files = [];

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.background = '#eef';
});
dropZone.addEventListener('dragleave', () => dropZone.style.background = '');
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.background = '';
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(fileListInput) {
  files = Array.from(fileListInput);
  sortFiles();
  displayFileList();
}

function sortFiles() {
  const order = sortOrderSelect.value;
  if (order === 'name-asc') files.sort((a, b) => a.name.localeCompare(b.name));
  if (order === 'name-desc') files.sort((a, b) => b.name.localeCompare(a.name));
  if (order === 'date-asc') files.sort((a, b) => a.lastModified - b.lastModified);
  if (order === 'date-desc') files.sort((a, b) => b.lastModified - a.lastModified);
}

function displayFileList() {
  fileListElement.innerHTML = '';
  files.forEach(file => {
    const row = document.createElement('div');
    row.textContent = file.name;
    fileListElement.appendChild(row);
  });
}

function getPaddingFromStartNumber(numberStr) {
  const match = numberStr.match(/^0+(\d+)$/);
  if (match) {
    return numberStr.length;
  }
  return Math.max(3, numberStr.length);
}

function updatePreview() {
  const prefix = prefixInput.value.trim() || 'file';
  const start = startNumberInput.value.trim() || '1';
  const padding = getPaddingFromStartNumber(start);
  const underscore = underscoreCheckbox.checked ? '_' : '';
  const number = String(start).padStart(padding, '0');
  const previewName = `${prefix}${underscore}${number}.jpg`;
  previewElement.textContent = previewName;
}

renameBtn.addEventListener('click', async () => {
  const prefix = prefixInput.value.trim() || 'file';
  const start = parseInt(startNumberInput.value, 10) || 1;
  const padding = getPaddingFromStartNumber(startNumberInput.value.trim());
  const underscore = underscoreCheckbox.checked ? '_' : '';
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop();
    const number = String(start + i).padStart(padding, '0');
    const newName = `${prefix}${underscore}${number}.${ext}`;
    const content = await file.arrayBuffer();
    zip.file(newName, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'renamed_files.zip';
  a.click();
  URL.revokeObjectURL(url
