const unitMappings = {
  length: {
    meter: 1,
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701,
  },
  weight: {
    kilogram: 1,
    gram: 1000,
    pound: 2.20462,
    ounce: 35.274,
  },
  volume: {
    liter: 1,
    milliliter: 1000,
    gallon: 0.264172,
    pint: 2.11338,
  },
  time: {
    second: 1,
    minute: 1 / 60,
    hour: 1 / 3600,
    day: 1 / 86400,
  },
};

const categorySelect = document.getElementById("category");
const fromUnitSelect = document.getElementById("from-unit");
const toUnitSelect = document.getElementById("to-unit");
const convertBtn = document.getElementById("convert-btn");
const resetBtn = document.getElementById("reset-btn");
const resultDisplay = document.getElementById("result");
const valueInput = document.getElementById("value");
const batchToggle = document.getElementById("batch-toggle");
const batchValueInput = document.getElementById("batch-value");
const batchLabel = document.querySelector(".batch-input-label");
const singleLabel = document.querySelector(".single-input-label");
const decimalSeparatorSelect = document.getElementById("decimal-separator");
const batchOptions = document.getElementById("batch-options");
const downloadBtn = document.getElementById("download-btn");
const downloadFormatSelect = document.getElementById("downloadFormatSelect");
const copyBtn = document.getElementById("copy-btn");

// Populate units dropdowns
function populateUnits(category) {
  const units = Object.keys(unitMappings[category]);
  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";
  units.forEach((unit) => {
    const option1 = document.createElement("option");
    option1.value = unit;
    option1.textContent = unit;

    const option2 = document.createElement("option");
    option2.value = unit;
    option2.textContent = unit;

    fromUnitSelect.appendChild(option1);
    toUnitSelect.appendChild(option2);
  });
  fromUnitSelect.selectedIndex = 0;
  toUnitSelect.selectedIndex = 1;
}

// Validate a single number string according to decimal separator, return parsed float or null
function parseNumber(inputStr, decimalSeparator) {
  let normalized = inputStr.trim();
  if (!normalized) return null;

  const sepRegex = new RegExp(`\\${decimalSeparator}`, "g");
  const matches = normalized.match(sepRegex);
  if (matches && matches.length > 1) return null;

  if (decimalSeparator === ",") {
    normalized = normalized.replace(",", ".");
  }

  if (!/^[-+]?\d*\.?\d+$/.test(normalized)) return null;

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

// Convert a single number and return formatted string or error message
function convertSingle(valueStr) {
  const decimalSeparator = decimalSeparatorSelect.value;
  const inputValue = parseNumber(valueStr, decimalSeparator);
  if (inputValue === null) return "Invalid number";

  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const fromFactor = unitMappings[category][fromUnit];
  const toFactor = unitMappings[category][toUnit];
  const result = (inputValue / fromFactor) * toFactor;

  return `${valueStr} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
}

// Convert batch input (multiple lines)
function convertBatch(batchText) {
  const lines = batchText.split(/\r?\n/);
  const results = lines.map((line) => {
    if (!line.trim()) return "";
    return convertSingle(line);
  });
  return results.join("\n");
}

function updateUIForMode() {
  const isBatch = batchToggle.checked;
  valueInput.classList.toggle("hidden", isBatch);
  singleLabel.classList.toggle("hidden", isBatch);
  batchValueInput.classList.toggle("hidden", !isBatch);
  batchLabel.classList.toggle("hidden", !isBatch);
  batchOptions.classList.toggle("hidden", !isBatch);

  resultDisplay.textContent = "";
  copyBtn.disabled = true;
}

function performConversion() {
  if (batchToggle.checked) {
    const inputText = batchValueInput.value;
    if (!inputText.trim()) {
      resultDisplay.textContent = "Please enter numbers (one per line).";
      copyBtn.disabled = true;
      downloadBtn.disabled = true;
      return;
    }
    const output = convertBatch(inputText);
    resultDisplay.textContent = output;
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  } else {
    const val = valueInput.value.trim();
    if (!val) {
      resultDisplay.textContent = "Please enter a number.";
      copyBtn.disabled = true;
      return;
    }
    const output = convertSingle(val);
    resultDisplay.textContent = output;
    copyBtn.disabled = output === "Invalid number";
  }
}

function resetAll() {
  valueInput.value = "";
  batchValueInput.value = "";
  resultDisplay.textContent = "";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
  batchToggle.checked = false;
  decimalSeparatorSelect.value = ".";
  categorySelect.selectedIndex = 0;
  populateUnits(categorySelect.value);
  updateUIForMode();
}

// Download logic
function downloadResults() {
  if (!resultDisplay.textContent.trim()) return;

  const format = downloadFormatSelect.value;
  const lines = resultDisplay.textContent.split(/\r?\n/).filter((line) => line.trim() !== "");
  let dataStr = "";
  let mimeType = "";
  let filename = `conversion_results.${format}`;

  switch (format) {
    case "text":
      dataStr = lines.join("\n");
      mimeType = "text/plain";
      break;
    case "csv":
      dataStr = lines.map(line => `"${line.replace(/"/g, '""')}"`).join("\n");
      mimeType = "text/csv";
      break;
    case "json":
      dataStr = JSON.stringify(lines, null, 2);
      mimeType = "application/json";
      break;
    default:
      return;
  }

  const blob = new Blob([dataStr], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Copy to clipboard
function copyResults() {
  if (!resultDisplay.textContent.trim()) return;
  navigator.clipboard.writeText(resultDisplay.textContent).then(() => {
    alert("Results copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy. Please copy manually.");
  });
}

// Event Listeners
categorySelect.addEventListener("change", () => {
  populateUnits(categorySelect.value);
  resultDisplay.textContent = "";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
});

batchToggle.addEventListener("change", updateUIForMode);
convertBtn.addEventListener("click", performConversion);
resetBtn.addEventListener("click", resetAll);
downloadBtn.addEventListener("click", downloadResults);
copyBtn.addEventListener("click", copyResults);

decimalSeparatorSelect.addEventListener("change", () => {
  resultDisplay.textContent = "";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
});

// --- Start of added validation code ---

// Keep track of last valid input for reverting
let lastValidSingle = "";
let lastValidBatch = "";

// Helper: filter input by allowing only digits and selected separator
function filterInput(inputStr, separator) {
  // Remove anything not digit or separator
  let filtered = inputStr.replace(new RegExp(`[^0-9${separator}]`, "g"), "");

  // Allow only one separator
  const parts = filtered.split(separator);
  if (parts.length > 1) {
    filtered = parts[0] + separator + parts.slice(1).join("").replace(new RegExp(separator, "g"), "");
  }
  return filtered;
}

function handleValidation(inputElem, lastValidRef) {
  const sep = decimalSeparatorSelect.value;
  const val = inputElem.value;
  const filtered = filterInput(val, sep);

  if (filtered !== val) {
    if (confirm(`Unsupported characters detected. Use only numbers and the selected separator coma or full stop.\nDo you want to proceed and strip the other characters?`)) {
      inputElem.value = filtered;
      lastValidRef.value = filtered;
    } else {
      inputElem.value = lastValidRef.value;
    }
  } else {
    lastValidRef.value = val;
  }
}

// Single input validation on input and paste
valueInput.addEventListener("input", () => {
  handleValidation(valueInput, { value: lastValidSingle });
  lastValidSingle = valueInput.value; // update after handling
});

valueInput.addEventListener("paste", (e) => {
  const sep = decimalSeparatorSelect.value;
  const paste = (e.clipboardData || window.clipboardData).getData("text");
  const filtered = filterInput(paste, sep);

  if (filtered !== paste) {
    e.preventDefault();
    if (confirm(`Unsupported characters detected. Use only numbers and the selected separator coma or full stop.\nDo you want to proceed and strip the other characters?`)) {
      document.execCommand("insertText", false, filtered);
    }
  }
});

// Batch input validation on input and paste
batchValueInput.addEventListener("input", () => {
  const sep = decimalSeparatorSelect.value;
  // Split by lines and validate each line separately
  const lines = batchValueInput.value.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const filteredLine = filterInput(lines[i], sep);
    if (filteredLine !== lines[i]) {
      changed = true;
      if (confirm(`Unsupported characters detected on line ${i + 1}. Use only numbers and the selected separator coma or full stop.\nDo you want to proceed and strip the other characters?`)) {
        lines[i] = filteredLine;
      } else {
        // Revert entire batch input to last valid
        batchValueInput.value = lastValidBatch;
        return;
      }
    }
  }
  if (changed) {
    batchValueInput.value = lines.join("\n");
  }
  lastValidBatch = batchValueInput.value;
});

batchValueInput.addEventListener("paste", (e) => {
  const sep = decimalSeparatorSelect.value;
  const paste = (e.clipboardData || window.clipboardData).getData("text");
  // Check if paste contains only allowed chars per line
  const lines = paste.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const filteredLine = filterInput(lines[i], sep);
    if (filteredLine !== lines[i]) {
      e.preventDefault();
      if (confirm(`Unsupported characters detected on pasted content at line ${i + 1}. Use only numbers and the selected separator coma or full stop.\nDo you want to proceed and strip the other characters?`)) {
        const newPaste = lines.map(line => filterInput(line, sep)).join("\n");
        document.execCommand("insertText", false, newPaste);
      }
      return;
    }
  }
});

// --- End of added validation code ---

// Init
window.addEventListener("DOMContentLoaded", () => {
  populateUnits(categorySelect.value);
  updateUIForMode();
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
});
