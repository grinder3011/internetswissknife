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
  // Show/Hide input groups based on selected mode
  fileNamesInputGroup.classList.toggle('hidden', newMode !== 'cleanFilenames');
  textInputGroup.classList.toggle('hidden', newMode !== 'cleanTextInput');
  fileUploadInputGroup.classList.toggle('hidden', newMode !== 'cleanTextFile');

  // Clear outputs and inputs
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');
  fileNamesTextArea.value = '';
  textInputArea.value = '';
  textFileUpload.value = '';
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

// Handle processing for different input modes
async function handleProcess() {
  outputPreview.value = '';
  downloadButtons.classList.add('hidden');

  if (currentInputMode === 'cleanFilenames') {
    const filenamesRaw = fileNamesTextArea.value.trim();
    if (!filenamesRaw) {
      alert('Please enter one or more file names.');
      return;
    }
    const filenames = filenamesRaw.split('\n').map(f => f.trim()).filter(f => f.length > 0);

    const processedNames = filenames.map(name => processText(name));

    outputPreview.value = processedNames.join('\n');
    downloadButtons.classList.remove('hidden');

    downloadButton.onclick = () => {
      // Prepare downloadable text file with processed filenames
      const blob = new Blob([processedNames.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_filenames.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
