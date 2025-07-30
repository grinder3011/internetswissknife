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
const copyBtn = document.getElementById("copy-btn");
const resultDisplay = document.getElementById("result");
const valueInput = document.getElementById("value");
const decimalSeparatorSelect = document.getElementById("decimal-separator");

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

// Validate and parse number based on decimal separator choice
function parseNumber(input, decimalSeparator) {
  // Clean whitespace
  input = input.trim();

  // Reject empty strings
  if (!input) return NaN;

  // Check that the input contains only digits, one decimal separator, and optional leading - or +
  // Build regex dynamically based on separator
  const sep = decimalSeparator === "comma" ? "," : ".";
  const otherSep = decimalSeparator === "comma" ? "." : ",";

  // Reject if contains other decimal separator
  if (input.includes(otherSep)) return NaN;

  // Check valid format: optional sign, digits, optional one decimal separator, digits
  // Regex explanation:
  // ^[+-]? matches optional + or -
  // \d* matches zero or more digits
  // (sep\d+)? matches optional separator followed by one or more digits
  // $ end of string
  const regex = new RegExp(`^[+-]?\\d*(\\${sep}\\d+)?$`);
  if (!regex.test(input)) return NaN;

  // Replace decimal separator with '.' for Number conversion
  const normalized = decimalSeparator === "comma" ? input.replace(",", ".") : input;

  const number = Number(normalized);
  return isNaN(number) ? NaN : number;
}

convertBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const decimalSeparator = decimalSeparatorSelect.value;

  const rawInput = valueInput.value;

  // For now only single value mode, so parse one number
  const parsedNumber = parseNumber(rawInput, decimalSeparator);

  if (isNaN(parsedNumber)) {
    resultDisplay.textContent = "Please enter a valid number.";
    return;
  }

  const fromFactor = unitMappings[category][fromUnit];
  const toFactor = unitMappings[category][toUnit];
  const result = (parsedNumber / fromFactor) * toFactor;

  resultDisplay.textContent = `${parsedNumber} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
});

resetBtn.addEventListener("click", () => {
  valueInput.value = "";
  resultDisplay.textContent = "";
});

copyBtn.addEventListener("click", () => {
  if (!resultDisplay.textContent) return;
  navigator.clipboard.writeText(resultDisplay.textContent).then(() => {
    alert("Result copied to clipboard!");
  });
});

categorySelect.addEventListener("change", () => {
  populateUnits(categorySelect.value);
  resultDisplay.textContent = "";
  valueInput.value = "";
});

populateUnits(categorySelect.value);
