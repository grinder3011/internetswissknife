document.addEventListener("DOMContentLoaded", () => {
  const removeListedCheckbox = document.getElementById("removeListedChars");
  const customCharsInput = document.getElementById("customCharsInput");
  const cleanBtn = document.getElementById("cleanBtn");

  // Enable/disable custom chars input based on checkbox
  removeListedCheckbox.addEventListener("change", () => {
    customCharsInput.disabled = !removeListedCheckbox.checked;
    if (!removeListedCheckbox.checked) customCharsInput.value = "";
  });

  cleanBtn.addEventListener("click", () => {
    let text = document.getElementById("inputText").value;

    // Option: Remove all special chars (keep only letters, numbers, spaces)
    if (document.getElementById("removeSpecialChars").checked) {
      text = text.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    // Option: Remove listed special chars
    if (removeListedCheckbox.checked) {
      const charsToRemove = customCharsInput.value;
      if (charsToRemove) {
        // Split by comma and trim spaces
        const charsArray = charsToRemove.split(",").map(c => c.trim()).filter(c => c.length > 0);
        if (charsArray.length) {
          // Build regex pattern to remove listed chars globally
          const pattern = new RegExp(`[${charsArray.map(c => escapeRegex(c)).join("")}]`, "g");
          text = text.replace(pattern, "");
        }
      }
    }

    // Option: Trim extra spaces between characters
    if (document.getElementById("trimSpaces").checked) {
      text = text.replace(/\s+/g, " ");
    }

    // Option: Insert separator between words
    if (document.getElementById("insertSeparator").checked) {
      const sep = document.querySelector('input[name="separator"]:checked').value;
      // Replace all spaces between words with separator
      text = text.trim().replace(/\s+/g, sep);
    }

    document.getElementById("outputText").value = text;
  });

  // Utility to escape special regex chars in user input
  function escapeRegex(string) {
    return string.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  }
});
