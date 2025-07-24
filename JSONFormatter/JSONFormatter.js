document.addEventListener('DOMContentLoaded', () => {
  const inputArea = document.getElementById('json-input');
  const formatBtn = document.getElementById('format-btn');
  const validateBtn = document.getElementById('validate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const uploadInput = document.getElementById('upload-json');

  const popup = document.getElementById('popup');
  const popupText = document.getElementById('popup-text');
  const closePopup = document.getElementById('close-popup');
  const progressBar = document.getElementById('progress');

  function showPopup(message, isError = false) {
    popupText.textContent = message;
    popup.classList.add('visible');
    popup.classList.toggle('error', isError);
    popup.classList.toggle('success', !isError);
    progressBar.style.width = '0%';

    // Animate progress bar to 100%
    setTimeout(() => {
      progressBar.style.transition = 'width 0.5s ease-in-out';
      progressBar.style.width = '100%';
    }, 50);

    // Auto close after 3.5s
    setTimeout(() => {
      popup.classList.remove('visible');
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
    }, 3500);
  }

  closePopup.addEventListener('click', () => {
    popup.classList.remove('visible');
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
  });

  formatBtn.addEventListener('click', () => {
    const text = inputArea.value.trim();
    try {
      const json = JSON.parse(text);
      const formatted = JSON.stringify(json, null, 2);
      inputArea.value = formatted;
      showPopup('✅ JSON formatted successfully.');
    } catch (e) {
      showPopup('❌ Invalid JSON. Please check for syntax errors.', true);
    }
  });

  validateBtn.addEventListener('click', () => {
    const text = inputArea.value.trim();
    try {
      JSON.parse(text);
      showPopup('✅ JSON is valid.');
    } catch (e) {
      showPopup('❌ Invalid JSON: ' + e.message, true);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputArea.value = '';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(inputArea.value)
      .then(() => showPopup('📋 Copied to clipboard.'))
      .catch(() => showPopup('❌ Failed to copy.', true));
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([inputArea.value], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formatted.json';
    a.click();
  });

  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      inputArea.value = reader.result;
    };
    reader.readAsText(file);
  });

  // 💡 Toggle "How to use this tool" box
  const toggleHintBtn = document.getElementById('toggle-hint');
  const hintBox = document.getElementById('hint-box');

  toggleHintBtn.addEventListener('click', () => {
    hintBox.classList.toggle('hidden');
  });
});
