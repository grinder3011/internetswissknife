const inputArea = document.getElementById("json-input");
const outputArea = document.getElementById("json-output");
const formatBtn = document.getElementById("format-btn");
const clearBtn = document.getElementById("clear-btn");
const lineNumbers = document.getElementById("line-numbers");

// Popup elements
const popupOverlay = document.getElementById("popup-overlay");
const popupBox = document.getElementById("popup-box");
const popupMessage = document.getElementById("popup-message");
const closePopupBtn = document.getElementById("close-popup");

// Show popup with a message
function showPopup(message, isError = false) {
  popupMessage.textContent = message;
  popupBox.classList.toggle("error", isError);
  popupOverlay.classList.add("visible");

  // Optionally auto-close after 4s
  setTimeout(() => {
    popupOverlay.classList.remove("visible");
  }, 4000);
}

// Dismiss manually
closePopupBtn.addEventListener("click", () => {
  popupOverlay.classList.remove("visible");
});

function updateLineNumbers(text) {
  const lines = text.split("\n").length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
}

// Format JSON
formatBtn.addEventListener("click", () => {
  const raw = inputArea.value.trim();

  if (!raw) {
    showPopup("No input provided.", true);
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const formatted = JSON.stringify(parsed, null, 2);
    outputArea.value = formatted;
    updateLineNumbers(formatted);
    showPopup("✅ Formatting successful. No errors found.");
  } catch (err) {
    outputArea.value = "";
    updateLineNumbers("");
    showPopup("❌ Invalid JSON format. Check your syntax.", true);
  }
});

// Clear all
clearBtn.addEventListener("click", () => {
  inputArea.value = "";
  outputArea.value = "";
  updateLineNumbers("");
});
