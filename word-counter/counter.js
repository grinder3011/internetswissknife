const textInput = document.getElementById("text-input");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
const charNoSpaceCountEl = document.getElementById("char-nospace-count");

const toggleOptionsBtn = document.getElementById("toggle-options-btn");
const moreOptions = document.getElementById("more-options");
const resetBtn = document.getElementById("reset-btn");

const includeSpacesCheckbox = document.getElementById("include-spaces");
const ignorePunctuationCheckbox = document.getElementById("ignore-punctuation");

function updateCounts() {
  let text = textInput.value;

  const includeSpaces = includeSpacesCheckbox.checked;
  const ignorePunctuation = ignorePunctuationCheckbox.checked;

  let words = text.trim().split(/\s+/).filter(Boolean);

  if (ignorePunctuation) {
    words = words.map((word) => word.replace(/[^\w\s]|_/g, ""));
  }

  const wordCount = words.filter(Boolean).length;
  const charCount = includeSpaces ? text.length : text.replace(/\s/g, "").length;
  const charNoSpace = text.replace(/\s/g, "").length;

  wordCountEl.textContent = wordCount;
  charCountEl.textContent = charCount;
  charNoSpaceCountEl.textContent = charNoSpace;
}

textInput.addEventListener("input", updateCounts);
includeSpacesCheckbox.addEventListener("change", updateCounts);
ignorePunctuationCheckbox.addEventListener("change", updateCounts);

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  includeSpacesCheckbox.checked = true;
  ignorePunctuationCheckbox.checked = false;
  updateCounts();
});

toggleOptionsBtn.addEventListener("click", () => {
  const isExpanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  moreOptions.hidden = isExpanded;
  toggleOptionsBtn.setAttribute("aria-expanded", String(!isExpanded));
  toggleOptionsBtn.innerHTML =
    (!isExpanded ? "Less options " : "More options ") +
    '<i class="fas fa-chevron-down arrow"></i>';
});

updateCounts(); // Initial calculation
