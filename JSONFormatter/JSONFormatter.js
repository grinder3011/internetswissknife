document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("json-input");
  const formatBtn = document.getElementById("format-btn");
  const validateBtn = document.getElementById("validate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const uploadInput = document.getElementById("upload-json");
  const uploadLabel = document.getElementById("upload-label");
  const validationResult = document.getElementById("validation-result");
  const tooltipBtn = document.getElementById("toggle-tooltip");
  const tooltipBox = document.getElementById("tooltip-box");

  const enableActions = () => {
    formatBtn.disabled = false;
    validateBtn.disabled = false;
    clearBtn.disabled = false;
    copyBtn.disabled = false;
    downloadBtn.disabled = false;

    formatBtn.classList.remove("disabled");
    validateBtn.classList.remove("disabled");
    clearBtn.classList.remove("disabled");
    copyBtn.classList.remove("disabled");
    downloadBtn.classList.remove("disabled");
  };

  const disableActions = () => {
    formatBtn.disabled = true;
    validateBtn.disabled = true;
    clearBtn.disabled = true;
    copyBtn.disabled = true;
    downloadBtn.disabled = true;

    formatBtn.classList.add("disabled");
    validateBtn.classList.add("disabled");
    clearBtn.classList.add("disabled");
    copyBtn.classList.add("disabled");
    downloadBtn.classList.add("disabled");
  };

  const showResult = (message, isSuccess) => {
    validationResult.textContent = message;
    validationResult.className = isSuccess ? "success" : "error";
  };

  const formatJSON = () => {
    const raw = input.value.trim();
    try {
      const obj = JSON.parse(raw);
      const formatted = JSON.stringify(obj, null, 2);
      input.value = formatted;
      showResult("✅ JSON formatted successfully.", true);
    } catch (err) {
      showResult("❌ Error: Invalid JSON. " + err.message, false);
    }
  };

  const validateJSON = () => {
    const raw = input.value.trim();
    try {
      JSON.parse(raw);
      showResult("✅ No errors found. JSON is valid.", true);
    } catch (err) {
      showResult("❌ Error: Invalid JSON. " + err.message, false);
    }
  };

  const clearInput = () => {
    input.value = "";
    showResult("", true);
    disableActions();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input.value).then(() => {
      showResult("✅ Copied to clipboard.", true);
    }).catch(() => {
      showResult("❌ Failed to copy.", false);
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([input.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      input.value = event.target.result;
      enableActions();
      validationResult.textContent = "";
    };
    reader.readAsText(file);
    e.target.value = ""; // allow same file to be uploaded again
  };

  const toggleTooltip = () => {
    tooltipBox.classList.toggle("visible");
  };

  // Listeners
  input.addEventListener("input", () => {
    if (input.value.trim() === "") {
      disableActions();
      validationResult.textContent = "";
    } else {
      enableActions();
    }
  });

  formatBtn.addEventListener("click", formatJSON);
  validateBtn.addEventListener("click", validateJSON);
  clearBtn.addEventListener("click", clearInput);
  copyBtn.addEventListener("click", copyToClipboard);
  downloadBtn.addEventListener("click", downloadJSON);
  uploadInput.addEventListener("change", handleUpload);
  tooltipBtn.addEventListener("click", toggleTooltip);

  // Initialize
  disableActions();
});
