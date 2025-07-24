document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const uploadJson = document.getElementById('upload-json');
  const formatBtn = document.getElementById('format-btn');
  const validateBtn = document.getElementById('validate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const helpToggle = document.getElementById('help-toggle');
  const helpText = document.getElementById('help-text');
  const statusPopup = document.getElementById('status-popup');
  const statusMessage = document.getElementById('status-message');
  const statusIcon = document.getElementById('status-icon');
  const statusClose = document.getElementById('status-close');

  // Helper to enable/disable buttons based on textarea content
  function updateButtonStates() {
    const hasText = jsonInput.value.trim().length > 0;
    [formatBtn, validateBtn, clearBtn, copyBtn, downloadBtn].forEach(btn => {
      btn.disabled = !hasText;
    });
  }

  // Show status popup
  function showPopup(message, success = true) {
    statusMessage.textContent = message;
    statusIcon.textContent = success ? '✔️' : '❌';
    statusPopup.style.backgroundColor = success ? '#4b6cb7' : '#d9534f';
    statusPopup.classList.remove('hidden');
    // Auto-hide after 4 seconds
    clearTimeout(showPopup.hideTimeout);
    showPopup.hideTimeout = setTimeout(() => {
      statusPopup.classList.add('hidden');
    }, 4000);
  }

  // Close popup on button click
  statusClose.addEventListener('click', () => {
    statusPopup.classList.add('hidden');
    clearTimeout(showPopup.hideTimeout);
  });

  // Format JSON
  formatBtn.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonInput.value);
      const formatted = JSON.stringify(parsed, null, 2);
      jsonInput.value = formatted;
      showPopup('JSON formatted successfully.', true);
      updateButtonStates();
    } catch (e) {
      showPopup(`Error: Invalid JSON. ${e.message}`, false);
    }
  });

  // Validate JSON
  validateBtn.addEventListener('click', () => {
    try {
      JSON.parse(jsonInput.value);
      showPopup('No errors found. JSON is valid.', true);
    } catch (e) {
      showPopup(`Error: Invalid JSON. ${e.message}`, false);
    }
  });

  // Clear input
  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    updateButtonStates();
    showPopup('Input cleared.', true);
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    if (!navigator.clipboard) {
      // fallback for older browsers
      jsonInput.select();
      document.execCommand('copy');
      showPopup('Copied to clipboard.', true);
    } else {
      navigator.clipboard.writeText(jsonInput.value)
        .then(() => showPopup('Copied to clipboard.', true))
        .catch(() => showPopup('Failed to copy.', false));
    }
  });

  // Download JSON file
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([jsonInput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showPopup('Download started.', true);
  });

  // Help toggle
  helpToggle.addEventListener('click', () => {
    const expanded = helpToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      helpText.classList.add('hidden');
      helpToggle.setAttribute('aria-expanded', 'false');
    } else {
      helpText.classList.remove('hidden');
      helpToggle.setAttribute('aria-expanded', 'true');
    }
  });

  // Upload JSON file and place content in textarea
  uploadJson.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      jsonInput.value = reader.result;
      updateButtonStates();
      showPopup(`Loaded file: ${file.name}`, true);
      uploadJson.value = ''; // reset input to allow same file upload
    };
    reader.readAsText(file);
  });

  // Update buttons on input change
  jsonInput.addEventListener('input', updateButtonStates);

  // Initial disable buttons on page load
  updateButtonStates();
});
