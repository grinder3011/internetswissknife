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
  }
};

const categorySelect = document.getElementById("category");
const fromUnitSelect = document.getElementById("from-unit");
const toUnitSelect = document.getElementById("to-unit");
const convertBtn = document.getElementById("convert-btn");
const resetBtn = document.getElementById("reset-btn");
const resultDisplay = document.getElementById("result");
const valueInput = document.getElementById("value");
const batchInput = document.getElementById("batchInput");
const toggleModeBtn = document.getElementById("toggleModeBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadFormatSelect = document.getElementById("downloadFormatSelect");
const valueLabel = document.getElementById("valueLabel");

let isBatchMode = false;

function populateUnits(category) {
  const units = Object.keys(unitMappings[category]);
  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";
  units.forEach(unit => {
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

function isValidNumber(str) {
  // Check if str is a valid number (accept decimals, optional minus)
  // Reject if multiple dots or commas
  if (!str) return false;
  // Remove whitespace
  str = str.trim();
  if (str === '') return false;
  // Reject if more than one dot
  if ((str.match(/\./g) || []).length > 1) return false;
  // Reject if any commas (comma not allowed in this design)
  if (str.includes(',')) return false;
  // Check if valid number
  return !isNaN(Number(str));
}

function convertSingle(value, category, fromUnit, toUnit) {
  const fromFactor = unitMappings[category][fromUnit];
  const toFactor = unitMappings[category][toUnit];
  return (value / fromFactor) * toFactor;
}

function convertBatch(lines, category, fromUnit, toUnit) {
  return lines.map(line => {
    if (!isValidNumber(line)) return "Invalid number";
    const num = parseFloat(line);
    const converted = convertSingle(num, category, fromUnit, toUnit);
    return `${num} ${fromUnit} = ${converted.toFixed(4)} ${toUnit}`;
  });
}

function renderResults(results) {
  if (Array.isArray(results)) {
    // batch mode
    resultDisplay.innerHTML = results.map(r => `<div>${r}</div>`).join('');
  } else {
    // single mode
    resultDisplay.textContent = results;
  }
  copyBtn.disabled = false;
}

function clearResults() {
  resultDisplay.textContent = "";
  copyBtn.disabled = true;
}

// Event handlers
categorySelect.addEventListener("change", () => {
  populateUnits(categorySelect.value);
  clearResults();
  if (isBatchMode) batchInput.value = "";
  else valueInput.value = "";
});

convertBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;

  if (!isBatchMode) {
    const inputValue = valueInput.value.trim();
    if (!isValidNumber(inputValue)) {
      resultDisplay.textContent = "Please enter a valid number.";
      copyBtn.disabled = true;
      return;
    }
    const num = parseFloat(inputValue);
    const result = convertSingle(num, category, fromUnit, toUnit);
    renderResults(`${num} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`);
  } else {
    const lines = batchInput.value.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
    if (lines.length === 0) {
      resultDisplay.textContent = "Please enter one or more numbers, one per line.";
      copyBtn.disabled = true;
      return;
    }
    const results = convertBatch(lines, category, fromUnit, toUnit);
    renderResults(results);
  }
});

resetBtn.addEventListener("click", () => {
  valueInput.value = "";
  batchInput.value = "";
  clearResults();
});

toggleModeBtn.addEventListener("click", () => {
  isBatchMode = !isBatchMode;
  if (isBatchMode) {
    // Show batch textarea, hide single input
    batchInput.style.display = "block";
    valueInput.style.display = "none";
    valueLabel.textContent = "Values (one per line)";
    toggleModeBtn.textContent = "Switch to Single Mode";
    downloadBtn.style.display = "inline-block";
    downloadFormatSelect.style.display = "inline-block";
  } else {
    // Show single input, hide batch textarea
    batchInput.style.display = "none";
    valueInput.style.display = "inline-block";
    valueLabel.textContent = "Value";
    toggleModeBtn.textContent = "Switch to Batch Mode";
    downloadBtn.style.display = "none";
    downloadFormatSelect.style.display = "none";
  }
  clearResults();
  valueInput.value = "";
  batchInput.value = "";
});

// Copy results to clipboard
copyBtn.addEventListener("click", () => {
  let textToCopy = "";
  if (isBatchMode) {
    textToCopy = Array.from(resultDisplay.children).map(div => div.textContent).join('\n');
  } else {
    textToCopy = resultDisplay.textContent;
  }
  if (!textToCopy) return;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Results copied to clipboard!");
  }, () => {
    alert("Failed to copy results.");
  });
});

// Download results as txt/csv/json
downloadBtn.addEventListener("click", () => {
  if (!isBatchMode) return; // Only batch mode

  const results = Array.from(resultDisplay.children).map(div => div.textContent);
  if (results.length === 0) {
    alert("No results to download.");
    return;
  }

  const format = downloadFormatSelect.value;
  let content = "";
  let filename = `conversion_results.${format}`;

  if (format === "txt") {
    content = results.join('\n');
  } else if (format === "csv") {
    // CSV with 2 columns: input, output
    // Parsing strings like "x unit = y unit"
    // We'll split by "=" sign to get input and output
    const rows = results.map(line => {
      const parts = line.split(" = ");
      return parts.length === 2 ? `"${parts[0]}","${parts[1]}"` : `"${line}"`;
    });
    content = "Input,Output\n" + rows.join("\n");
  } else if (format === "json") {
    // JSON array of objects {input: "...", output: "..."}
    const jsonArray = results.map(line => {
      const parts = line.split(" = ");
      return parts.length === 2 ? { input: parts[0], output: parts[1] } : { raw: line };
    });
    content = JSON.stringify(jsonArray, null, 2);
  }

  const blob = new Blob([content], { type: "text/" + format });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize units dropdown
populateUnits(categorySelect.value);
