// Elements
const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
const fileNamesInputGroup = document.getElementById('fileNamesInput');
const textInputGroup = document.getElementById('textInput');
const fileUploadInputGroup = document.getElementById('fileUploadInput');
const fileUploadForNames = document.getElementById('fileUploadForNames');

const fileNamesTextArea = document.getElementById('fileNamesTextArea');
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

// Current input mode
let currentInputMode = 'cleanFilenames';

// Utility Functions
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
  fileNamesTextArea.value = '';
  textInputArea.value = '';
  textFileUpload.value = '';
  fileUploadForNames.value = '';
}

// Text cleaning functions
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

// Processing logic
async function handleProcess() {
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');

  if (currentInputMode === 'cleanFilenames') {
    const files = fileUploadForNames.files;

    if (files.length === 0) {
      alert('Please upload one or more files to rename.');
      return;
    }

    const validFiles = Array.from(files).filter(f => f.size <= MAX_FILE_SIZE);

    if (validFiles.length === 0) {
      alert('No valid files under 50MB were uploaded.');
      return;
    }

    const cleanedFiles = [];

    for (const file of validFiles) {
      const { base, ext } = splitFilename(file.name);
      const cleanedBase = processText(base);
      const newName = cleanedBase + ext;
      const fileContent = await file.arrayBuffer();
      cleanedFiles.push({ name: newName, content: fileContent });
    }

    outputPreview.value = cleanedFiles.map(f => f.name).join('\n');
    downloadButtons.classList.remove('hidden');

    downloadButton.onclick = () => {
      if (cleanedFiles.length === 1) {
        const file = cleanedFiles[0];
        const blob = new Blob([file.content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: download all renamed files in one text file (simulate ZIP)
        const log = cleanedFiles.map(f => `--- ${f.name} ---\n[Binary content preserved]`).join('\n\n');
        const blob = new Blob([log], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'renamed_files_log.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    };

  } else if (currentInputMode === 'cleanTextInput') {
    const inputText = textInputArea.value;
    if (!inputText.trim()) {
      alert('Please enter or paste some text.');
      return;
    }

    const processedText = processText(inputText);
    outputPreview.value = processedText;
    downloadButtons.classList.remove('hidden');

    downloadButton.onclick = () => {
      const blob = new Blob([processedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_text.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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

    downloadButton.onclick = () => {
      if (processedFileContents.length === 1) {
        const blob = new Blob([processedFileContents[0]], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = processedFileNames[0];
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const combined = processedFileContents.map((content, i) =>
          `--- ${processedFileNames[i]} ---\n${content}`).join('\n\n');
        const blob = new Blob([combined], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cleaned_text_files.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    };
  }
}

// Event Listeners
inputModeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    switchInputMode(e.target.value);
  });
});

specialCharRemovalRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    enableDisableListedCharsInput

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

                         
