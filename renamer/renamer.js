document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const sortOrderSelect = document.getElementById('sort-order');
  const prefixInput = document.getElementById('prefix');
  const startNumberInput = document.getElementById('start-number');
  const useUnderscoreCheckbox = document.getElementById('use-underscore');
  const renameBtn = document.getElementById('rename-btn');
  const exampleFilenameDiv = document.getElementById('example-filename');

  let files = [];

  // Helpers
  function zeroPad(num, width) {
    const numStr = num.toString();
    return numStr.length >= width ? numStr : '0'.repeat(width - numStr.length) + numStr;
  }

  function updateExampleFilename() {
    if (files.length === 0) {
      exampleFilenameDiv.textContent = '';
      return;
    }
    const prefix = prefixInput.value.trim() || 'file';
    const startNumStr = startNumberInput.value.trim() || '1';

    // Determine padding width based on start number length
    const paddingWidth = startNumStr.length;

    const startNum = parseInt(startNumStr, 10) || 1;

    // Get extension of first file or fallback to .txt
    let ext = '.txt';
    if (files[0].name.includes('.')) {
      ext = files[0].name.substring(files[0].name.lastIndexOf('.'));
    }

    const separator = useUnderscoreCheckbox.checked ? '_' : '';

    exampleFilenameDiv.textContent = `${prefix}${separator}${zeroPad(startNum, paddingWidth)}${ext}`;
  }

  function sortFiles() {
    const order = sortOrderSelect.value;
    switch (order) {
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
      case 'id-desc':
        files.sort((a, b) => extractLeadingNumber(b.name) - extractLeadingNumber(a.name));
        break;
      case 'custom':
      default:
        // Keep as is (manual)
        break;
    }
  }

  function extractLeadingNumber(filename) {
    const match = filename.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function handleFiles(selectedFiles) {
    files = Array.from(selectedFiles);
    sortFiles();
    updateExampleFilename();
  }

  // Event handlers

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
    }
  });

  sortOrderSelect.addEventListener('change', () => {
    sortFiles();
    updateExampleFilename();
  });

  prefixInput.addEventListener('input', updateExampleFilename);
  startNumberInput.addEventListener('input', updateExampleFilename);
  useUnderscoreCheckbox.addEventListener('change', updateExampleFilename);

  renameBtn.addEventListener('click', async () => {
    if (files.length === 0) {
      alert('Please add some files first.');
      return;
    }

    const prefix = prefixInput.value.trim() || 'file';
    const startNumStr = startNumberInput.value.trim() || '1';
    const paddingWidth = startNumStr.length;
    let startNum = parseInt(startNumStr, 10);
    if (isNaN(startNum)) startNum = 1;

    const separator = useUnderscoreCheckbox.checked ? '_' : '';

    const zip = new JSZip();

    files.forEach((file, index) => {
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
      const newName = `${prefix}${separator}${zeroPad(startNum + index, paddingWidth)}${ext}`;
      zip.file(newName, file);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${prefix}_files.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error creating ZIP file: ' + err);
    }
  });

  // Initialize empty example filename on load
  updateExampleFilename();
});
