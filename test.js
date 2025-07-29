document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const wordCount = document.getElementById("word-count");
  const charCount = document.getElementById("char-count");
  const charNoSpaceCount = document.getElementById("char-nospace-count");
  const sentenceCount = document.getElementById("sentence-count");
  const uniqueWordCount = document.getElementById("unique-word-count");

  const includeSpaces = document.getElementById("include-spaces");
  const ignorePunctuation = document.getElementById("ignore-punctuation");
  const countSentencesToggle = document.getElementById("count-sentences");
  const filter1Letter = document.getElementById("filter-1-letter");
  const filter2Letter = document.getElementById("filter-2-letter");

  const toggleOptionsBtn = document.getElementById("toggle-options-btn");
  const moreOptions = document.getElementById("more-options");

  const resetBtn = document.getElementById("reset-btn");
  const copyResultsBtn = document.getElementById("copy-results");
  const downloadResultsBtn = document.getElementById("download-results");

  const toUpper = document.getElementById("to-uppercase");
  const toLower = document.getElementById("to-lowercase");
  const toTitle = document.getElementById("to-titlecase");

  const copyOriginal = document.getElementById("copy-original");
  const downloadOriginal = document.getElementById("download-original");

  let originalText = "";

  function analyzeText() {
    let text = textInput.value;
    originalText = text;

    const words = text.trim().split(/\s+/).filter(Boolean);
    const filteredWords = ignorePunctuation.checked ? words.map(w => w.replace(/[.,!?;:()"'\[\]{}]/g, "")) : words;

    wordCount.textContent = filteredWords.length;
    charCount.textContent = includeSpaces.checked ? text.length : text.replace(/\s/g, "").length;
    charNoSpaceCount.textContent = text.replace(/\s/g, "").length;

    if (countSentencesToggle.checked) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      sentenceCount.textContent = sentences.length;
    } else {
      sentenceCount.textContent = "-";
    }

    // Unique word count
    const cleanedWords = filteredWords.map(w => w.toLowerCase());
    let uniqueSet = new Set(cleanedWords);
    if (filter1Letter.checked) uniqueSet = new Set([...uniqueSet].filter(w => w.length > 1));
    if (filter2Letter.checked) uniqueSet = new Set([...uniqueSet].filter(w => w.length > 2));
    uniqueWordCount.textContent = uniqueSet.size;
  }

  textInput.addEventListener("input", analyzeText);
  includeSpaces.addEventListener("change", analyzeText);
  ignorePunctuation.addEventListener("change", analyzeText);
  countSentencesToggle.addEventListener("change", analyzeText);
  filter1Letter.addEventListener("change", analyzeText);
  filter2Letter.addEventListener("change", analyzeText);

  toggleOptionsBtn.addEventListener("click", () => {
    const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
    toggleOptionsBtn.setAttribute("aria-expanded", !expanded);
    moreOptions.hidden = expanded;
    toggleOptionsBtn.querySelector(".arrow").classList.toggle("fa-chevron-up");
    toggleOptionsBtn.querySelector(".arrow").classList.toggle("fa-chevron-down");
  });

  resetBtn.addEventListener("click", () => {
    textInput.value = "";
    analyzeText();
  });

  copyResultsBtn.addEventListener("click", () => {
    const result = `Words: ${wordCount.textContent}\nCharacters: ${charCount.textContent}\nCharacters (no spaces): ${charNoSpaceCount.textContent}\nSentences: ${sentenceCount.textContent}\nUnique words: ${uniqueWordCount.textContent}`;
    navigator.clipboard.writeText(result);
  });

  downloadResultsBtn.addEventListener("click", () => {
    const result = `Words: ${wordCount.textContent}\nCharacters: ${charCount.textContent}\nCharacters (no spaces): ${charNoSpaceCount.textContent}\nSentences: ${sentenceCount.textContent}\nUnique words: ${uniqueWordCount.textContent}`;
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text-analysis.txt";
    link.click();
  });

  copyOriginal.addEventListener("click", () => {
    navigator.clipboard.writeText(originalText);
  });

  downloadOriginal.addEventListener("click", () => {
    const blob = new Blob([originalText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "original-text.txt";
    link.click();
  });

  // Case Conversion
  toUpper.addEventListener("click", () => {
    textInput.value = textInput.value.toUpperCase();
    analyzeText();
  });

  toLower.addEventListener("click", () => {
    textInput.value = textInput.value.toLowerCase();
    analyzeText();
  });

  toTitle.addEventListener("click", () => {
    textInput.value = textInput.value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    analyzeText();
  });

  analyzeText();
});
