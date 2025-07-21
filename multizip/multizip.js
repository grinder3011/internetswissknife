const dropzone = document.getElementById('dropzone');
const fileList = document.getElementById('fileList');
const formatSelect = document.getElementById('formatSelect');
const downloadBtn = document.getElementById('downloadBtn');

let files = [];

function updateFileList() {
  fileList.innerHTML = '';
  files.forEach((file, idx) => {
    const option = document.createElement('option');
    option.textContent = file.name;
    option.value = idx;
    fileList.appendChild(option);
  });
  downloadBtn.disabled = files.length === 0;
}

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');

  const droppedFiles = Array.from(e.dataTransfer.files);
  files = files.concat(droppedFiles);
  updateFileList();
});

downloadBtn.addEventListener('click', async () => {
  if (files.length === 0) return;

  const format = formatSelect.value;

  if (format === 'zip') {
    const zip = new JSZip();
    for (const file of files) {
      const content = await file.arrayBuffer();
      zip.file(file.name, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, 'archive.zip');

  } else if (format === 'gz') {
    // gzip compress each file individually and zip them together? or just gzip the concatenation?
    // Usually gzip compresses single files. So we’ll gzip each file separately and zip them.
    // For simplicity, let's gzip only the first file (or if multiple files, alert users)

    if (files.length !== 1) {
      alert('GZIP format supports only one file at a time.');
      return;
    }
    const file = files[0];
    const content = await file.arrayBuffer();
    const compressed = pako.gzip(new Uint8Array(content));
    const blob = new Blob([compressed], { type: 'application/gzip' });
    triggerDownload(blob, file.name + '.gz');

  } else if (format === 'tar') {
    // Use fflate to create tar archive
    const tarData = [];
    for (const file of files) {
      const content = new Uint8Array(await file.arrayBuffer());
      tarData.push({ name: file.name, data: content });
    }
    const tar = fflate.tarSync(tarData);
    const blob = new Blob([tar], { type: 'application/x-tar' });
    triggerDownload(blob, 'archive.tar');
  }
});

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
