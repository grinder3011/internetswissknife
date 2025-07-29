// === Word & Character Counter Plus JS ===

const textarea = document.getElementById("text-input");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");
const charNoSpaceCount = document.getElementById("char-nospace-count");
const sentenceCount = document.getElementById("sentence-count");
const uniqueWordCount = document.getElementById("unique-word-count");

const includeSpaces = document.getElementById("include-spaces");
const ignorePunctuation = document.getElementById("ignore-punctuation");
const enableSentenceCount = document.getElementById("enable-sentence-count");
const excludeOneLetterWords = document.getElementById("exclude-1-letter");
const excludeTwoLetterWords = document.getElementById("exclude-2-letter");

const uppercaseBtn = document.getElementById("uppercase-btn");
const lowercaseBtn = document.getElementById("lowercase-btn");
const titlecaseBtn = document.getElementById("titlecase-btn");

const copyResultsBtn = document.getElementById("copy-results-btn");
const downloadResultsBtn = document.getElementById("download-results-btn");
const copyOriginalBtn = document.getElementById("copy-original-btn");
const downloadOriginalBtn = document.getElementById("download-original-btn");

const resetBtn = document.getElementById("reset-btn");
const toggleOptionsBtn = document.getElementById("toggle-options-btn");
const moreOptions = document.getElementById("more-options");

let originalTextBackup = "";

function stripHTML(input) {
  const div = document.createElement("div");
  div.innerHTML = input;
  return div.textContent || div.innerText || "";
}

function updateCounts() {
  const rawText = textarea.value;
  const text = stripHTML(rawText);
  originalTextBackup = rawText;

  let processedText = text;
  let words = processedText.trim().split(/\s+/);

  if (ignorePunctuation.checked) {
    processedText = processedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'<>\[\]|@+]/g, "");
    words = processedText.trim().split(/\s+/);
  }

  if (excludeOneLetterWords.checked) {
    words = words.filter(word => word.length > 1);
  }

  if (excludeTwoLetterWords.checked) {
    words = words.filter(word => word.length > 2);
  }

  const characterCount = text.length;
  const characterCountNoSpaces = text.replace(/\s/g, "").length;

  let sentences = 0;
  if (enableSentenceCount.checked) {
    sentences = (text.match(/[.!?]+(?=\s|$)/g) || []).length;
  }

  const wordSet = new Set(words.map(w => w.toLowerCase()));

  wordCount.textContent = words.filter(Boolean).length;
  charCount.textContent = includeSpaces.checked ? characterCount : characterCountNoSpaces;
  charNoSpaceCount.textContent = characterCountNoSpaces;
  sentenceCount.textContent = sentences;
  uniqueWordCount.textContent = wordSet.size;
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

function downloadText(filename, text) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

textarea.addEventListener("input", updateCounts);

uppercaseBtn.addEventListener("click", () => {
  textarea.value = textarea.value.toUpperCase();
  updateCounts();
});

lowercaseBtn.addEventListener("click", () => {
  textarea.value = textarea.value.toLowerCase();
  updateCounts();
});

titlecaseBtn.addEventListener("click", () => {
  textarea.value = toTitleCase(textarea.value);
  updateCounts();
});

copyResultsBtn.addEventListener("click", () => {
  const results = `Words: ${wordCount.textContent}\nCharacters: ${charCount.textContent}\nCharacters (no spaces): ${charNoSpaceCount.textContent}\nSentences: ${sentenceCount.textContent}\nUnique Words: ${uniqueWordCount.textContent}`;
  navigator.clipboard.writeText(results);
});

downloadResultsBtn.addEventListener("click", () => {
  const results = `Words: ${wordCount.textContent}\nCharacters: ${charCount.textContent}\nCharacters (no spaces): ${charNoSpaceCount.textContent}\nSentences: ${sentenceCount.textContent}\nUnique Words: ${uniqueWordCount.textContent}`;
  downloadText("text-analysis-results.txt", results);
});

copyOriginalBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(originalTextBackup);
});

downloadOriginalBtn.addEventListener("click", () => {
  downloadText("original-text.txt", originalTextBackup);
});

resetBtn.addEventListener("click", () => {
  textarea.value = "";
  updateCounts();
});

toggleOptionsBtn.addEventListener("click", () => {
  const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  toggleOptionsBtn.setAttribute("aria-expanded", !expanded);
  moreOptions.hidden = expanded;
});

// Prevent drag-and-drop HTML paste
textarea.addEventListener("drop", e => e.preventDefault());
textarea.addEventListener("dragover", e => e.preventDefault());

updateCounts();

// Tooltip handling code
document.addEventListener('DOMContentLoaded', () => {
  const tooltipButtons = document.querySelectorAll('.tooltip-btn');

  tooltipButtons.forEach(btn => {
    const tooltip = btn.querySelector('.tooltip-text');

    btn.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    btn.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });

    // For accessibility, show tooltip on focus and hide on blur
    btn.addEventListener('focus', () => {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    btn.addEventListener('blur', () => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });
  });
});
