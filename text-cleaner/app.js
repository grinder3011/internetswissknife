// Elements
const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
const fileNamesInputGroup = document.getElementById('fileNamesInput');
const textInputGroup = document.getElementById('textInput');
const fileUploadInputGroup = document.getElementById('fileUploadInput');

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

// NEW: Create new input element for filename upload dynamically (replaces textarea)
let fileNameUploadInput = null;

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

  // Show/hide input groups based on selected mode
  if (newMode === 'cleanFilenames') {
    // Replace textarea with file input for filenames if not already created
    if (!fileNameUploadInput) {
      // Remove the existing textarea from the DOM
      fileNamesTextArea.style.display = 'none';

      // Create new input[type="file"] for filenames with multiple and max size limit
      fileNameUploadInput = document.createElement('input');
      fileNameUploadInput.type = 'file';
      fileNameUploadInput.multiple = true;
      fileNameUploadInput.id = 'fileNameUploadInput';
      fileNameUploadInput.accept = '*/*'; // allow any file type

      // Add max size message
      const maxSizeNote = document.createElement('small');
      maxSizeNote.id = 'maxSizeNote';
      maxSizeNote.textContent = 'You can upload multiple files (max size 50MB each).';
      maxSizeNote.style.display = 'block';
      maxSizeNote.style.marginTop = '6px';
      maxSizeNote.style.color = '#555';

      // Append file input and note to fileNamesInputGroup
      fileNamesInputGroup.appendChild(fileNameUploadInput);
      fileNamesInputGroup.appendChild(maxSizeNote);
    }
    fileNamesInputGroup.classList.remove('hidden');
    textInputGroup.classList.add('hidden');
    fileUploadInputGroup.classList.add('hidden');
  } else {
    // Show/hide original inputs for other modes
    fileNamesInputGroup.classList.toggle('hidden', true);
    textInputGroup.classList.toggle('hidden', newMode !== 'cleanTextInput');
    fileUploadInputGroup.classList.toggle('hidden', newMode !== 'cleanTextFile');

    // Restore textarea visibility for filenames mode if switching back
    if (fileNameUploadInput) {
      fileNamesTextArea.style.display = 'block';
      fileNameUploadInput.value = '';
      fileNameUploadInput.style.display = 'none';
      const maxSizeNote = document.getElementById('maxSizeNote');
      if (maxSizeNote) maxSizeNote.style.display = 'none';
    }
  }

  // Clear outputs and inputs
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');
  fileNamesTextArea.value = '';
  textInputArea.value = '';
  textFileUpload.value = '';
  if (fileNameUploadInput) fileNameUploadInput.value = '';
}

// Cleaners

// Remove all special characters (anything not a-zA-Z0-9 or whitespace or dash/underscore)
function removeAllSpecialChars(text) {
  return text.replace(/[^\w\s\-]/g, '');
}

// Remove only listed characters from text
function removeListedChars(text, chars) {
  if (!chars) return text;
  // Escape regex special chars for safe use
  const escapedChars = chars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp('[' + escapedChars + ']', 'g');
  return text.replace(regex, '');
}

// Trim extra spaces between words (collapse multiple spaces to one, trim ends)
function trimExtraSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Insert separator between words (replace spaces with selected separator)
function insertSeparator(text, separator) {
  // Collapse spaces first (to avoid multiple separators)
  text = trimExtraSpaces(text);
  return text.replace(/ /g, separator);
}

// Process the text based on options
function processText(text) {
  // Remove special characters
  const specialRemovalOption = document.querySelector('input[name="specialCharRemoval"]:checked').value;
  let result = text;

  if (specialRemovalOption === 'removeAll') {
    result = removeAllSpecialChars(result);
  } else if (specialRemovalOption === 'removeListed') {
    result = removeListedChars(result, listedCharsInput.value);
  }

  // Trim spaces if checked
  if (trimSpacesCheckbox.checked) {
    result = trimExtraSpaces(result);
  }

  // Insert separator if checked
  if (insertSeparatorCheckbox.checked) {
    const sep = separatorSelect.value || '-';
    result = insertSeparator(result, sep);
  }

  return result;
}

// Max file size limit in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Handle processing for different input modes
async function handleProcess() {
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');

  if (currentInputMode === 'cleanFilenames') {
    // Now use uploaded files instead of textarea input
    if (!fileNameUploadInput || !fileNameUploadInput.files.length) {
      alert('Please upload one or more files to clean their filenames.');
      return;
    }

    const files = Array.from(fileNameUploadInput.files);

    // Check file size limit
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 50MB size limit and will be skipped.`);
      }
    }

    // Filter files within size limit
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);

    if (!validFiles.length) {
      alert('No valid files to process (all exceeded 50MB).');
      return;
    }

    // Process filenames (excluding extension)
    const processedFileNames = validFiles.map(file => {
      const lastDotIndex = file.name.lastIndexOf('.');
      const namePart = lastDotIndex === -1 ? file.name : file.name.substring(0, lastDotIndex);
      const extPart = lastDotIndex === -1 ? '' : file.name.substring(lastDotIndex);

      const cleanedName = processText(namePart);
      return cleanedName + extPart;
    });

    // Build log content
    let logContent = '';
    validFiles.forEach((file, i) => {
      logContent += `${file.name}  -->  ${processedFileNames[i]}\n`;
    });

    // Output the log
    outputPreview.value = logContent;
    downloadButtons.classList.remove('hidden');

    downloadButton.onclick = () => {
      if (validFiles.length === 1) {
        // For single file: download log as TXT
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filename_clean_log.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        // For multiple files: prepare ZIP download
        // Since no external libs allowed, fallback to download combined log txt
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filename_clean_log.txt';
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

    // Show preview of first file (or combined text)
    outputPreview.value = processedFileContents.length === 1
      ? processedFileContents[0]
      : processedFileContents.map((content, i) => `--- ${processedFileNames[i]} ---\n${content}`).join('\n\n');

    downloadButtons.classList.remove('hidden');

    downloadButton.onclick = () => {
      if (processedFileContents.length === 1) {
        // Download single file
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
        // Multiple files - create zip for download
        // Since no external libs allowed, we fallback to downloading concatenated txt file
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
