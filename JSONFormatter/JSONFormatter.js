const input = document.getElementById('json-input');
const formatBtn = document.getElementById('format-btn');
const clearBtn = document.getElementById('clear-btn');
const lineNumbers = document.getElementById('line-numbers');

const popup = document.getElementById('popup');
const progressFill = document.getElementById('progress-fill');
const resultMessage = document.getElementById('result-message');
const closePopup = document.getElementById('close-popup');

// Update line numbers on input
input.addEventListener('input', updateLineNumbers);
input.addEventListener('scroll', () => {
  lineNumbers.scrollTop = input.scrollTop;
});

function updateLineNumbers() {
  const lines = input.value.split('\n').length;
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= lines; i++) {
    lineNumbers.innerHTML += i + '<br>';
  }
}
updateLineNumbers();

// Format button logic
formatBtn.addEventListener('click', () => {
  showPopup();
  setTimeout(() => {
    try {
      const parsed = JSON.parse(input.value);
      const formatted = JSON.stringify(parsed, null, 2);
      input.value = formatted;
      updateLineNumbers();
      fillProgress(100, "✅ No errors found. JSON formatted successfully.");
    } catch (err) {
      fillProgress(100, "❌ Error: Invalid JSON syntax.");
    }
  }, 300);
});

// Clear all
clearBtn.addEventListener('click', () => {
  input.value = '';
  updateLineNumbers();
});

// Popup logic
function showPopup() {
  popup.hidden = false;
  progressFill.style.width = '0%';
  resultMessage.textContent = 'Validating...';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = `${progress}%`;
    if (progress >= 90) clearInterval(interval);
  }, 50);
}

function fillProgress(percent, message) {
  progressFill.style.width = `${percent}%`;
  resultMessage.textContent = message;
}

closePopup.addEventListener('click', () => {
  popup.hidden = true;
});
