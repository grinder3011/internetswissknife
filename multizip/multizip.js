const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const createZipBtn = document.getElementById('createZipBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

let zip = new JSZip();
let zipBlob = null;

// Helper: Render file list UI with remove buttons
function renderFileList() {
  fileList.innerHTML = '';
  Object.keys(zip.files).forEach(filename => {
    const listItem = document.createElement('div');
    listItem.style.display = 'flex';
    listItem.style.justifyContent = 'space-between';
    listItem.style.alignItems = 'center';
    listItem.style.marginBottom = '6px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `📄 ${filename}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.background = 'transparent';
    removeBtn.style.border = 'none';
    removeBtn.style.color = '#d33';
    removeBtn.style.fontSize = '1.1em';

    removeBtn.addEventListener('click', () => {
      zip.remove(filename);
      renderFileList();
    });

    listItem.appendChild(nameSpan);
    listItem.appendChild(removeBtn);
    fileList.appendChild(listItem);
  });
}

// Add or replace files in zip and update UI
fileInput.addEventListener('change', (e) => {
  zipBlob = null; // reset blob since new files added

  Array.from(e.target.files).forEach(file => {
    // Replace file if exists
    if (zip.files[file.name]) {
      zip.remove(file.name);
    }
    zip.file(file.name, file);
  });

  renderFileList();

  // Reset input to allow re-upload of same files
  fileInput.value = '';
});

createZipBtn.addEventListener('click', async () => {
  if (!Object.keys(zip.files).length) {
    alert('No files selected!');
    return;
  }
  zipBlob = await zip.generateAsync({ type: 'blob' });
  alert('Archive created! Now you can download it.');
});

downloadBtn.addEventListener('click', () => {
  if (!zipBlob) {
    alert('First create the archive.');
    return;
  }

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'archive.zip';
  a.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener('click', () => {
  zip = new JSZip();
  zipBlob = null;
  fileInput.value = '';
  fileList.innerHTML = '';
});
