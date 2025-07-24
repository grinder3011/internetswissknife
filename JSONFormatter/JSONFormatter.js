const jsonInput = document.getElementById('json-input');
const fileInput = document.getElementById('file-input');
const formatBtn = document.getElementById('format-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const jsonOutput = document.getElementById('json-output');
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popup-close');
const popupMessage = document.getElementById('popup-message');
const progressBar = document.getElementById('progress-bar');

function showPopup(message, isError = false) {
  popupMessage.textContent = message;
  popup.style.borderColor = isError ? '#d9534f' : '#4b6cb7';
  popupMessage.style.color = isError ? '#d9534f' : '#333';
  progressBar.style.backgroundColor = isError ? '#d9534f' : '#4b6cb7';
  progressBar.style.width = '0%';
  popup.classList.add('visible');

  // Animate progress bar fill
  setTimeout(() => {
    progressBar.style.width = '100%';
  }, 10);
}

function hidePopup() {
  popup.classList.remove('visible');
  progressBar.style.width = '0%';
}

popupClose.addEventListener('click', hidePopup);

// File upload handler
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.name.endsWith('.json')) {
    showPopup('Please upload a valid JSON file.', true);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    jsonInput.value = e.target.result;
  };
  reader.readAsText(file);
});

// Format JSON on button click
formatBtn.addEventListener('click', () => {
  const text = jsonInput.value.trim();
  if (!text) {
    showPopup('Input is empty. Please paste JSON or upload a file.', true);
    return;
  }

  showPopup('Validating and formatting...');

  setTimeout(() => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      jsonOutput.textContent = formatted;
      showPopup('✅ Formatting completed. No errors found.');
    } catch (err) {
      jsonOutput.textContent = '';
      showPopup('⚠️ JSON Error: ' + err.message, true);
    }
  }, 200); // Simulate a short delay for progress bar effect
});

// Copy formatted JSON to clipboard
copyBtn.addEventListener('click', () => {
  const formattedText = jsonOutput.textContent;
  if (!formattedText) {
    showPopup('Nothing to copy. Format some JSON first.', true);
    return;
  }
  navigator.clipboard.writeText(formattedText).then(() => {
    showPopup('Copied formatted JSON to clipboard!');
  }).catch(() => {
    showPopup('Failed to copy. Please try manually.', true);
  });
});

// Clear all fields
clearBtn.addEventListener('click', () => {
  jsonInput.value = '';
  jsonOutput.textContent = '';
  fileInput.value = '';
  hidePopup();
});
