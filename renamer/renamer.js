const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileListContainer = document.getElementById('file-list');
const renameBtn = document.getElementById('rename-btn');
const prefixInput = document.getElementById('prefix');
const startNumberInput = document.getElementById('start-number');
const sortOrderSelect = document.getElementById('sort-order');
const previewBox = document.getElementById('example-preview');  // <=== FIXED here
const underscoreCheckbox = document.getElementById('use-underscore');

let files = [];
let customOrder = [];

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', e => {
  handleFiles(e.target.files);
});

function handleFiles(fileListInput) {
  files = Array.from(fileListInput);
  updateFileOrder();
  displayFileList();
  updatePreview();
}

function updateFileOrder() {
  const order = sortOrderSelect.value;

  if (order === 'name-asc') {
    files.sort((a, b) => a.name.localeCompare(b.name));
  } else if (order === 'name-desc') {
    files.sort((a, b) => b.name.localeCompare(a.name));
  } else if (order === 'date-asc') {
    files.sort((a, b) => a.lastModified - b.lastModified);
  } else if (order === 'date-desc') {
    files.sort((a, b) => b.lastModified - a.lastModified);
  } else if (order === 'id-asc') {
    files.sort((a, b) => extractNumericPrefix(a.name) - extractNumericPrefix(b.name));
  } else if (order === 'id-desc') {
    files.sort((a, b) => extractNumericPrefix(b.name) - extractNumericPrefix(a.name));
  }

  customOrder = [...files]; // fallback for manual drag (not yet implemented)
}

function extractNumericPrefix(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[0]) : Infinity;
}

function displayFileList() {
  fileListContainer.innerHTML = '';
  files.forEach((file, i) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.textContent = `${i + 1}. ${file.name}`;
    fileListContainer.appendChild(row);
  });
}

sortOrderSelect.addEventListener('change', () => {
  updateFileOrder();
  displayFileList();
  updatePreview();
});

renameBtn.addEventListener('click', async () => {
  if (files.length === 0) return;

  const prefix = prefixInput.value.trim() || 'file';
  const startNumber = parseInt(startNumberInput.value) || 1;
  const underscore = underscoreCheckbox.checked ? "_" : "";

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
    const num = (startNumber + i).toString().padStart(startNumberInput.value.length, '0');
    const newName = `${prefix}${underscore}${num}${ext}`;
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

function updatePreview() {
  const prefix = prefixInput.value.trim() || "file";
  const startNum = startNumberInput.value.trim();
  const useUnderscore = underscoreCheckbox.checked;

  if (!/^\d+$/.test(startNum)) {
    previewBox.textContent = "Enter a valid starting number.";
    previewBox.classList.add('error-text');
    return;
  }

  previewBox.classList.remove('error-text');

  const padded = startNum;
  const exampleExt = ".jpg";
  const separator = useUnderscore ? "_" : "";
  const exampleName = `${prefix}${separator}${padded}${exampleExt}`;

  // Wrap example filename in a styled span for better UX
  previewBox.innerHTML = `<span class="example-label">Example:</span> <span class="example-filename">${exampleName}</span>`;
}

prefixInput.addEventListener('input', updatePreview);
startNumberInput.addEventListener('input', updatePreview);
underscoreCheckbox.addEventListener('change', updatePreview);

updatePreview();

// 💡 Toggle "How to use this tool"
const howToToggle = document.getElementById("how-to-toggle");
const howToText = document.getElementById("how-to-text");

if (howToToggle && howToText) {
  howToToggle.addEventListener("click", () => {
    howToText.hidden = !howToText.hidden;
  });
}
