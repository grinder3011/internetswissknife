// app.js

// --- Cache DOM elements ---
const modeRadios = document.querySelectorAll('input[name="mode"]');
const fileNameUploadContainer = document.getElementById('fileNameUploadContainer');
const textInputContainer = document.getElementById('textInputContainer');
const textFileUploadContainer = document.getElementById('textFileUploadContainer');

const fileNamesInput = document.getElementById('fileNamesInput');
const textInput = document.getElementById('textInput');
const textFileInput = document.getElementById('textFileInput');

const removeAllSpecialCharsRadio = document.getElementById('removeAllSpecialChars');
const removeSelectedSpecialCharsRadio = document.getElementById('removeSelectedSpecialChars');
const customCharsInput = document.getElementById('customCharsInput');

const trimSpacesCheckbox = document.getElementById('trimSpaces');
const insertDashesUnderscoresCheckbox = document.getElementById('insertDashesUnderscores');
const dashesOption = document.getElementById('dashesOption');
const underscoresOption = document.getElementById('underscoresOption');

const outputTextarea = document.getElementById('outputTextarea');

const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');

const JSZip = window.JSZip; // Assuming JSZip included via script tag in html

// --- State ---
let currentMode = 'fileNames'; // default mode

// --- Helper Functions ---

// Show/hide input containers by mode
function updateModeUI() {
  fileNameUploadContainer.style.display = currentMode === 'fileNames' ? 'block' : 'none';
  textInputContainer.style.display = currentMode === 'textInput' ? 'block' : 'none';
  textFileUploadContainer.style.display = currentMode === 'textFile' ? 'block' : 'none';

  // Reset outputs and buttons
  outputTextarea.value = '';
  downloadBtn.style.display = 'none';
  copyBtn.style.display = 'none';
}

// Enable or disable custom chars input based on remove all vs selected
function updateCustomCharsInputState() {
  if (removeSelectedSpecialCharsRadio.checked) {
    customCharsInput.disabled = false;
  } else {
    customCharsInput.disabled = true;
    customCharsInput.value = '';
  }
}

// Utility: Clean text according to options
function cleanText(text) {
  let charsToRemove = '';

  if (removeAllSpecialCharsRadio.checked) {
    // Remove all special chars (anything not a-z, A-Z, 0-9, space)
    charsToRemove = null; // signify all special chars
  } else if (removeSelectedSpecialCharsRadio.checked) {
    charsToRemove = customCharsInput.value;
  }

  // Build regex for removal
  let cleaned = text;

  if (charsToRemove === null) {
    // Remove all special chars except letters, numbers and spaces
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
  } else if (charsToRemove.trim() !== '') {
    // Escape regex special chars in input
    const escapedChars = charsToRemove.split('').map(c => '\\' + c).join('');
    const reg = new RegExp('[' + escapedChars + ']', 'g');
    cleaned = cleaned.replace(reg, '');
  }

  // Trim extra spaces if checked
  if (trimSpacesCheckbox.checked) {
    // Replace multiple spaces with single space, trim ends
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  // Insert dashes or underscores if checked (replace spaces)
  if (insertDashesUnderscoresCheckbox.checked) {
    if (dashesOption.checked) {
      cleaned = cleaned.replace(/\s+/g, '-');
    } else if (underscoresOption.checked) {
      cleaned = cleaned.replace(/\s+/g, '_');
    }
  }

  return cleaned;
}

// Convert file name safely: keep extension and clean only basename
function cleanFileName(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  let name = filename;
  let ext = '';

  if (lastDotIndex !== -1) {
    name = filename.substring(0, lastDotIndex);
    ext = filename.substring(lastDotIndex);
  }

  const cleanedName = cleanText(name);
  return cleanedName + ext;
}

// Process file names: generate cleaned names, log changes, zip files with cleaned names
async function processFileNames(files) {
  if (files.length === 0) {
    alert('Please select one or more files.');
    return;
  }

  const zip = new JSZip();
  let log = 'Original Name → Cleaned Name\n----------------------------\n';

  for (const file of files) {
    const cleanedName = cleanFileName(file.name);
    log += `${file.name} → ${cleanedName}\n`;

    const content = await file.arrayBuffer();
    zip.file(cleanedName, content);
  }

  outputTextarea.value = log;

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);

  downloadBtn.href = url;
  downloadBtn.download = 'cleaned_files.zip';
  downloadBtn.style.display = 'inline-block';

  copyBtn.style.display = 'none';
}

// Process text input or text file
function processText(text) {
  if (!text) {
    alert('Please enter or upload some text.');
    return;
  }

  const cleaned = cleanText(text);

  let log = '';
  if (text === cleaned) {
    log = 'No changes made to the text.';
  } else {
    log = `Original text length: ${text.length}\nCleaned text length: ${cleaned.length}\n\nCleaned Text:\n${cleaned}`;
  }

  outputTextarea.value = log;

  // Prepare download for cleaned text
  const blob = new Blob([cleaned], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  downloadBtn.href = url;
  downloadBtn.download = 'cleaned_text.txt';
  downloadBtn.style.display = 'inline-block';

  // Show copy button
  copyBtn.style.display = 'inline-block';
}

// --- Event Listeners ---

// Mode radio buttons
modeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    currentMode = e.target.value;
    updateModeUI();
  });
});

// Remove all vs custom chars radio
removeAllSpecialCharsRadio.addEventListener('change', updateCustomCharsInputState);
removeSelectedSpecialCharsRadio.addEventListener('change', updateCustomCharsInputState);

// Insert dashes/underscores enabling/disabling
insertDashesUnderscoresCheckbox.addEventListener('change', () => {
  dashesOption.disabled = !insertDashesUnderscoresCheckbox.checked;
  underscoresOption.disabled = !insertDashesUnderscoresCheckbox.checked;
  if (!insertDashesUnderscoresCheckbox.checked) {
    dashesOption.checked = true; // default
  }
});

// Copy button
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputTextarea.value)
    .then(() => alert('Copied to clipboard!'))
    .catch(() => alert('Failed to copy!'));
});

// Process button
processBtn.addEventListener('click', async () => {
  downloadBtn.style.display = 'none';
  copyBtn.style.display = 'none';
  outputTextarea.value = '';

  if (currentMode === 'fileNames') {
    const files = fileNamesInput.files;
    await processFileNames(files);
  } else if (currentMode === 'textInput') {
    const text = textInput.value;
    processText(text);
  } else if (currentMode === 'textFile') {
    const files = textFileInput.files;
    if (files.length === 0) {
      alert('Please select a text file.');
      return;
    }

    // Read the first file as text
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      processText(e.target.result);
    };
    reader.onerror = function() {
      alert('Error reading the file.');
    };
    reader.readAsText(file);
  }
});

// Initialize UI on page load
updateModeUI();
updateCustomCharsInputState();
insertDashesUnderscoresCheckbox.dispatchEvent(new Event('change'));
