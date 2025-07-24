document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("json-input");
  const upload = document.getElementById("upload-json");
  const formatBtn = document.getElementById("format-btn");
  const validateBtn = document.getElementById("validate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const tooltipToggle = document.getElementById("show-tooltip");
  const tooltipContent = document.getElementById("tooltip-content");

  // Popup elements
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  const popupClose = document.getElementById("popup-close");

  function showPopup(message, isSuccess = true) {
    popup.classList.remove("hidden");
    popupMessage.textContent = message;
    popupMessage.style.color = isSuccess ? "#2c662d" : "#b00020";
  }

  popupClose.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      input.value = e.target.result;
    };
    reader.readAsText(file);
  });

  formatBtn.addEventListener("click", () => {
    const text = input.value.trim();
    try {
      const obj = JSON.parse(text);
      const pretty = JSON.stringify(obj, null, 2);
      input.value = pretty;
      showPopup("✅ JSON formatted and valid!", true);
    } catch (err) {
      showPopup("❌ Invalid JSON: " + err.message, false);
    }
  });

  validateBtn.addEventListener("click", () => {
    const text = input.value.trim();
    try {
      JSON.parse(text);
      showPopup("✅ JSON is valid!", true);
    } catch (err) {
      showPopup("❌ Invalid JSON: " + err.message, false);
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(input.value)
      .then(() => showPopup("📋 Copied to clipboard!", true))
      .catch(() => showPopup("❌ Failed to copy.", false));
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([input.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  tooltipToggle.addEventListener("change", () => {
    tooltipContent.classList.toggle("hidden", !tooltipToggle.checked);
  });
});
