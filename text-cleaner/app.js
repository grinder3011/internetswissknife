// script.js

document.addEventListener("DOMContentLoaded", () => {
  const inputTypeRadios = document.querySelectorAll("input[name='inputType']");
  const textInputGroup = document.getElementById("textInputGroup");
  const fileInputGroup = document.getElementById("fileInputGroup");
  const filenameInputGroup = document.getElementById("filenameInputGroup");

  const customCharInput = document.getElementById("customCharInput");
  const customCharRadio = document.querySelector("input[value='custom']");
  const allCharRadio = document.querySelector("input[value='all']");

  const insertSeparatorCheckbox = document.getElementById("insertSeparator");
  const separatorOptions = document.getElementById("separatorOptions");

  const cleanButton = document.getElementById("cleanButton");
  const outputText = document.getElementById("outputText");
  const outputActions = document.getElementById("outputActions");
  const copyButton = document.getElementById("copyButton");
  const downloadButton = document.getElementById("downloadButton");

  function updateInputGroups() {
    const selectedType = document.querySelector("input[name='inputType']:checked").value;
    textInputGroup.classList.toggle("hidden", selectedType !== "text");
    fileInputGroup.classList.toggle("hidden", selectedType !== "file");
    filenameInputGroup.classList.toggle("hidden", selectedType !== "filenames");
  }

  inputTypeRadios.forEach(radio => radio.addEventListener("change", updateInputGroups));

  customCharRadio.addEventListener("change", () => {
    customCharInput.disabled = false;
  });

  allCharRadio.addEventListener("change", () => {
    customCharInput.disabled = true;
    customCharInput.value = "";
  });

  insertSeparatorCheckbox.addEventListener("change", () => {
    separatorOptions.classList.toggle("hidden", !insertSeparatorCheckbox.checked);
  });

  cleanButton.addEventListener("click", () => {
    const inputType = document.querySelector("input[name='inputType']:checked").value;

    if (inputType === "text") {
      const text = document.getElementById("textInput").value;
      const cleaned = cleanText(text);
      outputText.value = cleaned;
      outputActions.classList.remove("hidden");
    }
    // TODO: Handle file cleaning and filename cleaning separately
  });

  function cleanText(text) {
    const removeAll = allCharRadio.checked;
    const trimSpaces = document.getElementById("trimSpaces").checked;
    const insertSeparator = insertSeparatorCheckbox.checked;
    const separatorType = document.querySelector("input[name='separatorType']:checked").value;
    const customChars = customCharInput.value.split(',').map(c => c.trim()).filter(Boolean);

    let cleaned = text;

    if (removeAll) {
      cleaned = cleaned.replace(/[^\w\s]/g, "");
    } else if (customChars.length > 0) {
      const pattern = new RegExp("[" + customChars.join("") + "]", "g");
      cleaned = cleaned.replace(pattern, "");
    }

    if (trimSpaces) {
      cleaned = cleaned.replace(/\s+/g, " ").trim();
    }

    if (insertSeparator) {
      const sep = separatorType === "dash" ? "-" : "_";
      cleaned = cleaned.trim().replace(/\s+/g, sep);
    }

    return cleaned;
  }

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(outputText.value);
  });

  downloadButton.addEventListener("click", () => {
    const blob = new Blob([outputText.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  updateInputGroups();
});
