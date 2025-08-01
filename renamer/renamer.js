document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const sortOrderSelect = document.getElementById('sort-order');
  const prefixInput = document.getElementById('prefix');
  const startNumberInput = document.getElementById('start-number');
  const useUnderscoreCheckbox = document.getElementById('use-underscore');
  const renameBtn = document.getElementById('rename-btn');
  const exampleFilenameDiv = document.getElementById('example-filename');
  const fileListContainer = document.createElement('div');
  let files = [];

  dropZone.appendChild(fileListContainer);

  // Helper: zero pad number to width
  function zeroPad(num, width) {
    const numStr = num.toString();
    return numStr.length >= width ? numStr : new Array(width - numStr.length + 1).join('0') + numStr;
  }

  // Update example filename with current inputs & first file extension or default
  function updateExampleFilename() {
    const prefix = prefixInput.value.trim() || 'file';
    const startNumStr = startNumberInput.value.trim() || '1';
    const paddingWidth = startNumStr.length;
    const startNum = parseInt(startNumStr, 10) || 1;
    let ext = '.txt';
    if (files.length > 0 && files[0].name.includes('.')) {
      ext = files[0].name.substring(files[0].name.lastIndexOf('.'));
    }
    const separator = useUnderscoreCheckbox.checked ? '_' : '';
    exampleFilenameDiv.textContent = `${prefix}${separator}${zeroPad(startNum, paddingWidth)}${ext}`;
  }

  // Render the list of files and enable drag to reorder if manual sorting
  function renderFileList() {
    fileListContainer.innerHTML = '';
    if (files.length === 0) {
      fileListContainer.textContent = 'No files loaded';
      return;
    }
    files.forEach((file, index) => {
      const fileDiv = document.createElement('div');
      fileDiv.textContent = file.name;
      fileListContainer.appendChild(fileDiv);
    });
  }

  // Sorting logic based on select option
  function sortFiles() {
    const order = sortOrderSelect.value;
    if (order === 'custom') {
      // Manual order - no sorting here, user can drag (drag code not shown here)
      // So just leave as is
      return;
    }
    files.sort((a, b) => {
      switch (order) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return a.lastModified - b.lastModified;
        case 'date-desc':
          return b.lastModified - a.lastModified;
        case 'id-asc': {
          // Leading number ascending
          const numA = extractLeadingNumber(a.name);
          const numB = extractLeadingNumber(b.name);
          return numA - numB;
        }
        case 'id-desc': {
          const numA = extractLeadingNumber(a.name);
          const numB = extractLeadingNumber(b.name);
          return numB - numA;
        }
        default:
          return 0;
      }
    });
  }

  // Helper to extract leading number from filename, returns 0 if none
  function extractLeadingNumber(name) {
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Handle files selection or drop
  function handleFiles(selectedFiles) {
    files = Array.from(selectedFiles).filter(f => !f.name.startsWith('.'));
    sortFiles();
    renderFileList();
    updateExampleFilename();
  }

  // File input change
  fileInput.addEventListener('change', e => {
    handleFiles(e.target.files);
  });

  // Dropzone drag and drop
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // Update example filename on input changes
  prefixInput.addEventListener('input', updateExampleFilename);
  startNumberInput.addEventListener('input', updateExampleFilename);
  useUnderscoreCheckbox.addEventListener('change', updateExampleFilename);

  // Sort order change triggers resort and example update
  sortOrderSelect.addEventListener('change', () => {
    sortFiles();
    renderFileList();
    updateExampleFilename();
  });

  // Rename & download logic (assumed unchanged)
  renameBtn.addEventListener('click', () => {
    if (files.length === 0) {
      alert('Please select files first.');
      return;
    }
    const prefix = prefixInput.value.trim() || 'file';
    const startNumStr = startNumberInput.value.trim() || '1';
    const paddingWidth = startNumStr.length;
    let currentNum = parseInt(startNumStr, 10) || 1;
    const separator = useUnderscoreCheckbox.checked ? '_' : '';

    const zip = new JSZip();
    files.forEach(file => {
      // Get extension from original file
      let ext = '.txt';
      if (file.name.includes('.')) {
        ext = file.name.substring(file.name.lastIndexOf('.'));
      }
      const newName = `${prefix}${separator}${zeroPad(currentNum, paddingWidth)}${ext}`;
      zip.file(newName, file);
      currentNum++;
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'renamed_files.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  });

  // Initial example filename update on page load
  updateExampleFilename();
});
