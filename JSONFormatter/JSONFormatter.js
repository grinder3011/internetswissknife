document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const uploadInput = document.getElementById('upload-json');
  const validateBtn = document.getElementById('validate-btn');
  const formatBtn = document.getElementById('format-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');

  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  const resultPopup = document.getElementById('result-popup');
  const resultMessage = document.getElementById('result-message');
  const closePopupBtn = document.getElementById('close-popup');

  // Helpers
  function showProgress(text = '', percent = 0) {
    progressContainer.classList.remove('hidden');
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
  }

  function hideProgress() {
    progressContainer.classList.add('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '';
  }

  function showResult(message, isError = false) {
    resultPopup.classList.remove('hidden');
    resultPopup.classList.toggle('error', isError);
    resultMessage.textContent = message;
  }

  function hideResult() {
    resultPopup.classList.add('hidden');
    resultMessage.textContent = '';
  }

  function enableButton(button) {
    button.disabled = false;
  }

  function disableButton(button) {
    button.disabled = true;
  }

  // Validate JSON text, return {valid, error}
  function validateJSON(text) {
    try {
      JSON.parse(text);
      return { valid: true, error: null };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  // Format JSON text with indentation
  function formatJSON(text) {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  }

  // Update buttons state based on input and validity
  function updateButtonsState() {
    const text = jsonInput.value.trim();
    if (!text) {
      disableButton(validateBtn);
      disableButton(formatBtn);
      disableButton(copyBtn);
      disableButton(downloadBtn);
      hideResult();
      hideProgress();
      return;
    }
    enableButton(validateBtn);

    // Validate for enabling format and other buttons
    const validation = validateJSON(text);
    if (validation.valid) {
      enableButton(formatBtn);
      enableButton(copyBtn);
      enableButton(downloadBtn);
      hideResult();
    } else {
      disableButton(formatBtn);
      disableButton(copyBtn);
      disableButton(downloadBtn);
      showResult(`Error found: ${validation.error}`, true);
    }
  }

  // Format button click
  formatBtn.addEventListener('click', () => {
    hideResult();
    const text = jsonInput.value.trim();
    if (!text) {
      showResult('Input is empty.', true);
      return;
    }

    // Show quick progress bar animation
    showProgress('Formatting...', 30);
    setTimeout(() => {
      try {
        const formatted = formatJSON(text);
        jsonInput.value = formatted;
        showProgress('Completed', 100);
        showResult('JSON formatted successfully!');
        updateButtonsState();
      } catch (err) {
        showResult(`Formatting error: ${err.message}`, true);
      } finally {
        setTimeout(hideProgress, 1200);
      }
    }, 300);
  });

  // Validate button click
  validateBtn.addEventListener('click', () => {
    hideResult();
    const text = jsonInput.value.trim();
    if (!text) {
      showResult('Input is empty.', true);
      return;
    }

    showProgress('Validating...', 50);
    setTimeout(() => {
      const validation = validateJSON(text);
      if (validation.valid) {
        showResult('✔️ No errors found. JSON is valid!');
      } else {
        showResult(`❌ JSON Error: ${validation.error}`, true);
      }
      hideProgress();
    }, 400);
  });

  // Clear button click
  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    hideResult();
    hideProgress();
    updateButtonsState();
    jsonInput.focus();
  });

  // Copy button click
  copyBtn.addEventListener('click', () => {
    const text = jsonInput.value.trim();
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      showResult('📋 Formatted JSON copied to clipboard!');
      setTimeout(hideResult, 2000);
    }).catch(() => {
      showResult('Failed to copy to clipboard.', true);
    });
  });

  // Download button click
  downloadBtn.addEventListener('click', () => {
    const text = jsonInput.value.trim();
    if (!text) return;

    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showResult('⬇️ JSON downloaded!');
    setTimeout(hideResult, 2000);
  });

  // Upload file input change
  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      jsonInput.value = e.target.result;
      updateButtonsState();
    };
    reader.readAsText(file);
  });

  // Close popup button
  closePopupBtn.addEventListener('click', () => {
    hideResult();
  });

  // On input change in textarea
  jsonInput.addEventListener('input', () => {
    hideResult();
    updateButtonsState();
  });

  // Initial state
  updateButtonsState();
});
