const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const createBtn = document.getElementById('create-archive-btn');
const downloadBtn = document.getElementById('download-archive-btn');
const resetBtn = document.getElementById('reset-btn');
const status = document.getElementById('status');

let files = [];
let zipBlobUrl = null;

fileInput.addEventListener('change', (e) => {
  // Clear previous files and UI list
  files = [];
  fileList.innerHTML = '';
  status.textContent = '';
  downloadBtn.disabled = true;

  // Store selected files
  files = Array.from(e.target.files);

  if (files.length === 0) {
    status.textContent = 'No files selected.';
    return;
  }

  // Show file names in list
  files.forEach((file) => {
    const li = document.createElement('li');
    li.textContent = file.name;
    fileList.appendChild(li);
  });

  status.textContent = `${files.length} file(s) selected. Ready to create archive.`;
});

createBtn.addEventListener('click', async () => {
  if (files.length === 0) {
    alert('Please select files first.');
    return;
  }

  status.textContent = 'Creating ZIP archive... Please wait.';
  createBtn.disabled = true;
  downloadBtn.disabled = true;

  const zip = new JSZip();

  try {
    for (const file of files) {
      zip.file(file.name, file);
    }
    const content = await zip.generateAsync({ type: 'blob' });

    // Clean up previous blob URL if any
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);

    zipBlobUrl = URL.createObjectURL(content);

    status.textContent = 'Archive created successfully!';
    downloadBtn.disabled = false;
  } catch (err) {
    status.textContent = 'Error creating archive.';
    console.error(err);
  } finally {
    createBtn.disabled = false;
  }
});

downloadBtn.addEventListener('click', () => {
  if (!zipBlobUrl) {
    alert('First create the archive.');
    return;
  }

  const a = document.createElement('a');
  a.href = zipBlobUrl;
  a.download = 'archive.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

resetBtn.addEventListener('click', () => {
  files = [];
  fileList.innerHTML = '';
  fileInput.value = '';
  status.textContent = '';
  downloadBtn.disabled = true;
  if (zipBlobUrl) {
    URL.revokeObjectURL(zipBlobUrl);
    zipBlobUrl = null;
  }
});
