// Elements
const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
const fileNamesInputGroup = document.getElementById('fileNamesInput');
const textInputGroup = document.getElementById('textInput');
const fileUploadInputGroup = document.getElementById('fileUploadInput');

const fileNamesTextArea = document.getElementById('fileNamesTextArea');
const fileUploadForNames = document.getElementById('fileUploadForNames');
const textInputArea = document.getElementById('textInputArea');
const textFileUpload = document.getElementById('textFileUpload');

const specialCharRemovalRadios = document.querySelectorAll('input[name="specialCharRemoval"]');
const listedCharsInput = document.getElementById('listedCharsInput');

const trimSpacesCheckbox = document.getElementById('trimSpacesCheckbox');
const insertSeparatorCheckbox = document.getElementById('insertSeparatorCheckbox');
const separatorSelect = document.getElementById('separatorSelect');

const processButton = document.getElementById('processButton');
const outputPreview = document.getElementById('outputPreview');
const downloadButtons = document.getElementById('downloadButtons');
const downloadButton = document.getElementById('downloadButton');
const copyLogButton = document.getElementById('copyLogButton');

let currentInputMode = 'cleanFilenames';

function enableDisableListedCharsInput() {
  const selected = document.querySelector('input[name="specialCharRemoval"]:checked').value;
  if (selected === 'removeListed') {
    listedCharsInput.disabled = false;
  } else {
    listedCharsInput.disabled = true;
    listedCharsInput.value = '';
  }
}

function enableDisableSeparatorSelect() {
  separatorSelect.disabled = !insertSeparatorCheckbox.checked;
}

function switchInputMode(newMode) {
  currentInputMode = newMode;
  fileNamesInputGroup.classList.toggle('hidden', newMode !== 'cleanFilenames');
  textInputGroup.classList.toggle('hidden', newMode !== 'cleanTextInput');
  fileUploadInputGroup.classList.toggle('hidden', newMode !== 'cleanTextFile');

  outputPreview.value = '';
  downloadButtons.classList.add('hidden');
  copyLogButton.classList.add('hidden');

  fileNamesTextArea.value = '';
  fileUploadForNames.value = '';
  textInputArea.value = '';
  textFileUpload.value = '';
}

// Cleaning functions
function removeAllSpecialChars(text) {
  return text.replace(/[^\w\s\-]/g, '');
}

function removeListedChars(text, chars) {
  if (!chars) return text;
  const escapedChars = chars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp('[' + escapedChars + ']', 'g');
  return text.replace(regex, '');
}

function trimExtraSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function insertSeparator(text, separator) {
  text = trimExtraSpaces(text);
  return text.replace(/ /g, separator);
}

function processText(text) {
  const specialRemovalOption = document.querySelector('input[name="specialCharRemoval"]:checked').value;
  let result = text;

  if (specialRemovalOption === 'removeAll') {
    result = removeAllSpecialChars(result);
  } else if (specialRemovalOption === 'removeListed') {
    result = removeListedChars(result, listedCharsInput.value);
  }

  if (trimSpacesCheckbox.checked) {
    result = trimExtraSpaces(result);
  }

  if (insertSeparatorCheckbox.checked) {
    const sep = separatorSelect.value || '-';
    result = insertSeparator(result, sep);
  }

  return result;
}

function splitFilename(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return { base: filename, ext: '' };
  }
  return {
    base: filename.slice(0, lastDotIndex),
    ext: filename.slice(lastDotIndex),
  };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Download helper for a single file
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Download multiple files sequentially to avoid browser blocking
async function downloadMultipleFiles(files) {
  for (const { content, filename } of files) {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    triggerDownload(blob, filename);
    // Delay a bit between downloads to avoid browser popup blocking
    await new Promise(r => setTimeout(r, 500));
  }
}

async function handleProcess() {
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');
  copyLogButton.classList.add('hidden');

  if (currentInputMode === 'cleanFilenames') {
    const files = fileUploadForNames.files;
    if (files.length > 0) {
      // Validate file sizes
      const validFiles = Array.from(files).filter(f => {
        if (f.size > MAX_FILE_SIZE) {
          alert(`File "${f.name}" exceeds the 50MB size limit and will be skipped.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        alert('No valid files under 50MB to process.');
        return;
      }

      const originalNames = validFiles.map(f => f.name);
      const cleanedNames = originalNames.map(filename => {
        const { base, ext } = splitFilename(filename);
        const cleanedBase = processText(base);
        return cleanedBase + ext;
      });

      // Show log preview: original -> cleaned
      const logLines = originalNames.map((orig, i) => `${orig}  →  ${cleanedNames[i]}`);
      outputPreview.value = logLines.join('\n');
      downloadButtons.classList.remove('hidden');
      copyLogButton.classList.remove('hidden');

      // Prepare files with cleaned names but same content
      const filesToDownload = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const newName = cleanedNames[i];
        // Use the original file content as is
        filesToDownload.push({ content: file, filename: newName });
      }

      downloadButton.onclick = async () => {
        // We need to read the files as blobs and trigger downloads with cleaned filenames
        const downloadItems = [];
        for (const file of validFiles) {
          const { base, ext } = splitFilename(file.name);
          const cleanedBase = processText(base);
          const cleanedFilename = cleanedBase + ext;
          // Just reuse the original file as Blob (file is Blob)
          downloadItems.push({ content: file, filename: cleanedFilename });
        }
        await downloadMultipleFiles(downloadItems);
      };

      copyLogButton.onclick = () => {
        navigator.clipboard.writeText(outputPreview.value);
        alert('Log copied to clipboard.');
      };

    } else {
      // User input filenames manually
      const filenamesRaw = fileNamesTextArea.value.trim();
      if (!filenamesRaw) {
        alert('Please enter one or more file names or upload files.');
        return;
      }
      const filenames = filenamesRaw.split('\n').map(f => f.trim()).filter(f => f.length > 0);

      const processedNames = filenames.map(name => processText(name));

      outputPreview.value = processedNames.join('\n');
      downloadButtons.classList.remove('hidden');
      copyLogButton.classList.remove('hidden');

      downloadButton.onclick = () => {
        const blob = new Blob([processedNames.join('\n')], { type: 'text/plain' });
        triggerDownload(blob, 'cleaned_filenames.txt');
      };

      copyLogButton.onclick = () => {
        navigator.clipboard.writeText(outputPreview.value);
        alert('Log copied to clipboard.');
      };
    }

  } else if (currentInputMode === 'cleanTextInput') {
    const inputText = textInputArea.value;
    if (!inputText.trim()) {
      alert('Please enter or paste some text.');
      return;
    }

    const processedText = processText(inputText);
    outputPreview.value = processedText;
    downloadButtons.classList.remove('hidden');
    copyLogButton.classList.remove('hidden');

    downloadButton.onclick = () => {
      const blob = new Blob([processedText], { type: 'text/plain' });
      triggerDownload(blob, 'cleaned_text.txt');
    };

    copyLogButton.onclick = () => {
      navigator.clipboard.writeText(outputPreview.value);
      alert('Log copied to clipboard.');
    };

  } else if (currentInputMode === 'cleanTextFile') {
    const files = textFileUpload.files;
    if (!files.length) {
      alert('Please upload one or more .txt files.');
      return;
    }

    const processedFileContents = [];
    const processedFileNames = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        alert(`Skipping non-txt file: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 50MB size limit and will be skipped.`);
        continue;
      }
      const text = await file.text();
      const cleaned = processText(text);
      processedFileContents.push(cleaned);
      processedFileNames.push(file.name.replace(/\.txt$/i, '_cleaned.txt'));
    }

    if (!processedFileContents.length) {
      alert('No valid .txt files processed.');
      return;
    }

    outputPreview.value = processedFileContents.length === 1
      ? processedFileContents[0]
      : processedFileContents.map((content, i) => `--- ${processedFileNames[i]} ---\n${content}`).join('\n\n');

    downloadButtons.classList.remove('hidden');
    copyLogButton.classList.remove('hidden');

    downloadButton.onclick = async () => {
      if (processedFileContents.length === 1) {
        const blob = new Blob([processedFileContents[0]], { type: 'text/plain' });
        triggerDownload(blob, processedFileNames[0]);
      } else {
        // Multiple cleaned text files - trigger downloads sequentially
        const downloadItems = processedFileContents.map((content, i) => ({
          content,
          filename: processedFileNames[i],
        }));
        await downloadMultipleFiles(downloadItems);
      }
    };

    copyLogButton.onclick = () => {
      navigator.clipboard.writeText(outputPreview.value);
      alert('Log copied to clipboard.');
    };
  }
}

// Event listeners
inputModeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    switchInputMode(e.target.value);
  });
});

specialCharRemovalRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    enableDisableListedCharsInput();
  });
});

insertSeparatorCheckbox.addEventListener('change', () => {
  enableDisableSeparatorSelect();
});

processButton.addEventListener('click', handleProcess);

// Initialize UI state
enableDisableListedCharsInput();
enableDisableSeparatorSelect();
switchInputMode(currentInputMode);
