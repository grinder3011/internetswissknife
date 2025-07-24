document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('json-input');
  const output = document.getElementById('json-output');
  const formatBtn = document.getElementById('format-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const uploadInput = document.getElementById('upload-json');

  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose = document.getElementById('popup-close');

  formatBtn.addEventListener('click', () => {
    const raw = input.value.trim();
    if (!raw) return;

    try {
      showPopup("Validating...");
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      output.innerHTML = formatted
        .split('\n')
        .map(line => `<span>${line}</span>`)
        .join('\n');

      showPopup("✅ JSON formatted successfully.");
    } catch (err) {
      showPopup("❌ Invalid JSON: " + err.message);
      output.textContent = '';
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    output.textContent = '';
  });

  copyBtn.addEventListener('click', () => {
    const text = output.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text);
    showPopup("📋 Copied to clipboard");
  });

  downloadBtn.addEventListener('click', () => {
    const text = output.textContent.trim();
    if (!text) return;

    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      input.value = reader.result;
    };
    reader.readAsText(file);
  });

  popupClose.addEventListener('click', () => {
    popup.hidden = true;
  });

  function showPopup(message) {
    popupMessage.textContent = message;
    popup.hidden = false;
    const bar = document.getElementById('popup-bar');
    bar.style.animation = 'none';
    void bar.offsetWidth; // restart animation
    bar.style.animation = null;
  }
});
