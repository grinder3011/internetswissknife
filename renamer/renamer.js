document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileList = document.getElementById('file-list');
  const filePreview = document.getElementById('file-preview');
  const howToToggle = document.getElementById('how-to-toggle');
  const howToText = document.getElementById('how-to-text');
  const exampleFilenameContainer = document.getElementById('example-filename-container');
  const exampleFilename = document.getElementById('example-filename');
  const submitBtn = document.getElementById('submit-btn');

  let files = [];

  // Utility: clear file list and preview
  function clearFilesDisplay() {
    fileList.innerHTML = '';
    filePreview.innerHTML = '';
  }

  // Display files in the file list
  function renderFileList() {
    fileList.innerHTML = '';
    files.forEach((file, index) => {
      const fileDiv = document.createElement('div');
      fileDiv.textContent = file.name;

      // Add a "preview" button for text files
      if (file.type.startsWith('text/') || file.name.match(/\.(txt|json|csv|md)$/i)) {
        const previewBtn = document.createElement('button');
        previewBtn.textContent = 'Preview';
        previewBtn.style.marginLeft = '1rem';
        previewBtn.addEventListener('click', () => {
          showPreview(file);
        });
        fileDiv.appendChild(previewBtn);
      }

      // Add a remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '1rem';
      removeBtn.addEventListener('click', () => {
        files.splice(index, 1);
        renderFileList();
        clearPreviewIfNecessary(file);
        updateExampleFilename();
      });
      fileDiv.appendChild(removeBtn);

      fileList.appendChild(fileDiv);
    });
  }

  // Show file preview (only text files supported)
  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.innerHTML = `<pre class="preview">${e.target.result}</pre>`;
    };
    reader.readAsText(file);
  }

  // Clear preview if the file was removed
  function clearPreviewIfNecessary(file) {
    if (filePreview.innerHTML.includes(file.name)) {
      filePreview.innerHTML = '';
    }
  }

  // Update example filename container
  function updateExampleFilename() {
    if (files.length > 0) {
      exampleFilenameContainer.style.display = 'flex';
      exampleFilename.textContent = files[0].name;
    } else {
      exampleFilenameContainer.style.display = 'none';
      exampleFilename.textContent = '';
    }
  }

  // Handle files added (from input or drop)
  function addFiles(newFiles) {
    for (const file of newFiles) {
      // Avoid duplicates by name + size (simple check)
      if (!files.some(f => f.name === file.name && f.size === file.size)) {
        files.push(file);
      }
    }
    renderFileList();
    updateExampleFilename();
  }

  // Drag & drop handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = '#e1eaff';
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.background = '';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = '';
    const dtFiles = e.dataTransfer.files;
    if (dtFiles.length > 0) {
      addFiles(dtFiles);
    }
  });

  // Click to open file selector
  dropZone.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = ''; // Accept all by default, adjust if needed
    fileInput.addEventListener('change', (e) => {
      addFiles(fileInput.files);
    });
    fileInput.click();
  });

  // How-to toggle button
  howToToggle.addEventListener('click', () => {
    if (howToText.style.display === 'none' || howToText.style.display === '') {
      howToText.style.display = 'block';
      howToToggle.textContent = 'Hide How-To';
    } else {
      howToText.style.display = 'none';
      howToToggle.textContent = 'Show How-To';
    }
  });

  // Submit button event (for demonstration)
  submitBtn.addEventListener('click', () => {
    alert(`Submitting ${files.length} file(s) with text input: "${document.getElementById('input-text').value}"`);
  });
});
