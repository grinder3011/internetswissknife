document.addEventListener('DOMContentLoaded', () => {
  const uploadInput = document.getElementById('upload-json');
  const formatBtn = document.getElementById('format-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const jsonInput = document.getElementById('json-input');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = progressBar.querySelector('.progress-fill');
  const progressText = progressBar.querySelector('.progress-text');
  const resultPopup = document.getElementById('result-popup');
  const resultIcon = document.getElementById('result-icon');
  const resultText = document.getElementById('result-text');
  const resultCloseBtn = document.getElementById('result-close-btn');

  // Upload file and read
  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      jsonInput.value = e.target.result;
      hideResult();
      hideProgress();
    };
    reader.readAsText(file);
  });

  // Format and validate JSON
  formatBtn.addEventListener('click', () => {
    hideResult();
    showProgress();

    progressFill.style.width = '0%';
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 50);

    setTimeout(() => {
      const rawText = jsonInput.value.trim();
      if (!rawText) {
        showResult('error', 'Input is empty. Please paste or upload JSON.');
        hideProgress();
        return;
      }

      try {
        const parsed = JSON.parse(rawText);
        const pretty = JSON.stringify(parsed, null, 2);
        jsonInput.value = pretty;
        showResult('success', '✔️ JSON is valid and formatted.');
      } catch (err) {
        showResult('error', `❌ JSON error: ${err.message}`);
      }

      hideProgress();
    }, 500);
  });

  // Clear input
  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    hideResult();
    hideProgress();
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
      showResult('error', 'Nothing to copy: input is empty.');
      return;
    }
    navigator.clipboard.writeText(jsonInput.value).then(() => {
      showResult('success', '📋 JSON copied to clipboard!');
    }).catch(() => {
      showResult('error', 'Failed to copy to clipboard.');
    });
  });

  // Download formatted JSON
  downloadBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
      showResult('error', 'Nothing to download: input is empty.');
      return;
    }
    const blob = new Blob([jsonInput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  // Close popup
  resultCloseBtn.addEventListener('click', hideResult);

  // Helpers
  function showProgress() {
    progressBar.classList.remove('hidden');
    progressFill.style.width = '0%';
  }
  function hideProgress() {
    progressBar.classList.add('hidden');
    progressFill.style.width = '0%';
  }
  function showResult(type, message) {
    resultPopup.classList.remove('hidden');
    if (type === 'success') {
      resultPopup.style.background = '#d4edda';
      resultPopup.style.borderColor = '#28a745';
      resultIcon.textContent = '✅';
      resultText.textContent = message;
      resultText.style.color = '#155724';
    } else {
      resultPopup.style.background = '#f8d7da';
      resultPopup.style.borderColor = '#dc3545';
      resultIcon.textContent = '❌';
      resultText.textContent = message;
      resultText.style.color = '#721c24';
    }
  }
  function hideResult() {
    resultPopup.classList.add('hidden');
  }
});
