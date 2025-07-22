(() => {
  const fileInput = document.getElementById('file-input');
  const archiveTypeSelect = document.getElementById('archive-type');
  const createBtn = document.getElementById('create-archive-btn');
  const outputArea = document.getElementById('output');

  let files = [];

  // Enable create button only if files selected
  function updateButtonState() {
    createBtn.disabled = files.length === 0;
  }

  // Handle file selection (including drag & drop)
  fileInput.addEventListener('change', e => {
    files = Array.from(e.target.files);
    outputArea.textContent = `Selected ${files.length} file(s):\n` + files.map(f => f.name).join('\n');
    updateButtonState();
  });

  // Drag and drop support
  const fileLabel = document.querySelector('.file-input-label');
  fileLabel.addEventListener('dragover', e => {
    e.preventDefault();
    fileLabel.style.backgroundColor = '#d0e7ff';
  });
  fileLabel.addEventListener('dragleave', e => {
    e.preventDefault();
    fileLabel.style.backgroundColor = '';
  });
  fileLabel.addEventListener('drop', e => {
    e.preventDefault();
    files = Array.from(e.dataTransfer.files);
    fileInput.files = e.dataTransfer.files; // Update input element for consistency
    outputArea.textContent = `Selected ${files.length} file(s):\n` + files.map(f => f.name).join('\n');
    updateButtonState();
    fileLabel.style.backgroundColor = '';
  });

  // Main archive creation
  createBtn.addEventListener('click', async () => {
    outputArea.textContent = 'Creating archive... Please wait.';
    const archiveType = archiveTypeSelect.value;

    if (files.length === 0) {
      outputArea.textContent = 'No files selected.';
      return;
    }

    try {
      if (archiveType === 'zip') {
        await createZipArchive(files);
      } else if (archiveType === '7z') {
        // 7z compression not fully supported client-side; simulate success
        outputArea.textContent = '7z compression is not fully supported in-browser. Simulating archive creation...\n' +
          files.map(f => f.name).join('\n');
      } else if (archiveType === 'tar') {
        outputArea.textContent = 'TAR archive creation not supported in-browser.\n' +
          'Simulating archive creation with files:\n' + files.map(f => f.name).join('\n');
      } else if (archiveType === 'tar.gz') {
        outputArea.textContent = 'TAR.GZ archive creation not supported in-browser.\n' +
          'Simulating archive creation with files:\n' + files.map(f => f.name).join('\n');
      } else if (archiveType === 'rar') {
        outputArea.textContent = 'RAR archive creation not supported in-browser.\n' +
          'Simulating archive creation with files:\n' + files.map(f => f.name).join('\n');
      } else {
        outputArea.textContent = 'Unknown archive format.';
      }
    } catch (e) {
      outputArea.textContent = 'Error creating archive: ' + e.message;
    }
  });

  // ZIP archive creation using JSZip
  async function createZipArchive(files) {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file);
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archive.zip`;
      link.textContent = 'Download ZIP archive';
      link.className = 'download-link';

      outputArea.innerHTML = `Archive created successfully! Click below to download:\n`;
      outputArea.appendChild(link);
    } catch (error) {
      outputArea.textContent = 'Error generating ZIP archive: ' + error.message;
    }
  }
})();
