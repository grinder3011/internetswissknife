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

categorySelect.addEventListener("change", () => {
  populateUnits(categorySelect.value);
  resultDisplay.textContent = "";
  valueInput.value = "";
});

convertBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const inputValue = parseFloat(valueInput.value);

  if (isNaN(inputValue)) {
    resultDisplay.textContent = "Please enter a valid number.";
    return;
  }

  const fromFactor = unitMappings[category][fromUnit];
  const toFactor = unitMappings[category][toUnit];
  const result = (inputValue / fromFactor) * toFactor;

  resultDisplay.textContent = `${inputValue} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
});

resetBtn.addEventListener("click", () => {
  valueInput.value = "";
  resultDisplay.textContent = "";
});

populateUnits(categorySelect.value);
