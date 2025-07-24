const formatBtn = document.getElementById('format-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');
const inputArea = document.getElementById('json-input');
const outputArea = document.getElementById('json-output');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalMessage = document.getElementById('modal-message');

formatBtn.addEventListener('click', () => {
  showModal('⏳ Validating...');

  setTimeout(() => {
    const raw = inputArea.value.trim();

    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      outputArea.textContent = formatted;
      showModal('✅ Format successful. No errors found!');
    } catch (e) {
      outputArea.textContent = '';
      showModal(`❌ Invalid JSON: ${e.message}`);
    }
  }, 300);
});

copyBtn.addEventListener('click', () => {
  const content = outputArea.textContent;
  if (!content) return;
  navigator.clipboard.writeText(content).then(() => {
    showModal('📋 Copied to clipboard!');
  });
});

clearBtn.addEventListener('click', () => {
  inputArea.value = '';
  outputArea.textContent = '';
});

downloadBtn.addEventListener('click', () => {
  const content = outputArea.textContent;
  if (!content) return;

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'formatted.json';
  link.click();
  URL.revokeObjectURL(url);
});

modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
});

function showModal(message) {
  modalMessage.innerHTML = `<p>${message}</p>`;
  modal.classList.remove('hidden');
}
