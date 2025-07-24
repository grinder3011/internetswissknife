document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const uploadInput = document.getElementById('upload-json');
  const formatBtn = document.getElementById('format-btn');
  const validateBtn = document.getElementById('validate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const tooltipToggle = document.getElementById('tooltip-toggle');
  const tooltipText = document.getElementById('tooltip-text');
  const resultMessage = document.getElementById('result-message');

  // Toggle tooltip text visibility
  tooltipToggle.addEventListener('click', () => {
    if (tooltipText.classList.contains('hidden')) {
      tooltipText.classList.remove('hidden');
    } else {
      tooltipText.classList.add('hidden');
    }
  });

  // Upload JSON file and populate textarea
  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      alert('Please upload a valid JSON file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      jsonInput.value = evt.target.result;
      resultMessage.classList.add('hidden');
    };
    reader.readAsText(file);
  });

  // Format JSON (pretty print)
  formatBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) {
      showResult('Input is empty.', true);
      return;
    }
    try {
      const obj = JSON.parse(raw);
      const pretty = JSON.stringify(obj, null, 2);
      jsonInput.value = pretty;
      showResult('JSON formatted successfully. No errors found.', false);
    } catch (err) {
      showResult('Error: Invalid JSON. ' + err.message, true);
    }
  });

  // Validate JSON only
  validateBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) {
      showResult('Input is empty.', true);
      return;
    }
    try {
      JSON.parse(raw);
      showResult('Validation complete. No errors found.', false);
    } catch (err) {
      showResult('Validation error: ' + err.message, true);
    }
  });

  // Clear input
  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    resultMessage.classList.add('hidden');
  });

  // Copy formatted JSON to clipboard
  copyBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
      showResult('Nothing to copy.', true);
      return;
    }
    navigator.clipboard.writeText(jsonInput.value)
      .then(() => showResult('Copied to clipboard!', false))
      .catch(() => showResult('Failed to copy.', true));
  });

  // Download formatted JSON as file
  downloadBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
      showResult('Nothing to download.', true);
      return;
    }
    const blob = new Blob([jsonInput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    showResult('Download started.', false);
  });

  // Helper to show result messages with styling
  function showResult(message, isError) {
    resultMessage.textContent = message;
    if (isError) {
      resultMessage.style.backgroundColor = '#f8d7da'; // red-ish
      resultMessage.style.color = '#721c24';
      resultMessage.style.border = '1px solid #f5c6cb';
    } else {
      resultMessage.style.backgroundColor = '#d1e7dd'; // green-ish
      resultMessage.style.color = '#0f5132';
      resultMessage.style.border = '1px solid #badbcc';
    }
    resultMessage.classList.remove('hidden');
  }
});
