// counter.js

// Elements
const textarea = document.getElementById('text-input');

const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const charNoSpaceCountEl = document.getElementById('char-nospace-count');
const sentenceCountEl = document.getElementById('sentence-count');
const uniqueWordCountEl = document.getElementById('unique-word-count');

const includeSpacesCheckbox = document.getElementById('include-spaces');
const ignorePunctuationCheckbox = document.getElementById('ignore-punctuation');
const countSentencesCheckbox = document.getElementById('count-sentences');
const filterOneLetterCheckbox = document.getElementById('filter-1-letter');
const filterTwoLetterCheckbox = document.getElementById('filter-2-letter');

const toggleOptionsBtn = document.getElementById('toggle-options-btn');
const moreOptionsSection = document.getElementById('more-options');

const copyResultsBtn = document.getElementById('copy-results');
const downloadResultsBtn = document.getElementById('download-results');

const copyOriginalBtn = document.getElementById('copy-original');
const downloadOriginalBtn = document.getElementById('download-original');

const toUppercaseBtn = document.getElementById('to-uppercase');
const toLowercaseBtn = document.getElementById('to-lowercase');
const toTitlecaseBtn = document.getElementById('to-titlecase');

const resetBtn = document.getElementById('reset-btn');

let originalTextBackup = '';

// Utility functions
function cleanText(text, ignorePunctuation) {
  if (!ignorePunctuation) return text;
  // Remove common punctuation for word count
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"'’“”]/g, '');
}

function countWords(text, ignorePunctuation) {
  const cleaned = cleanText(text.trim(), ignorePunctuation);
  if (!cleaned) return [];
  // Split on whitespace
  return cleaned.split(/\s+/);
}

function countSentences(text) {
  // Simple sentence split by punctuation marks .!? plus line breaks
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return sentences ? sentences.length : 0;
}

function uniqueWords(words, excludeOneLetter, excludeTwoLetter) {
  const lowerWords = words.map(w => w.toLowerCase());
  const filtered = lowerWords.filter(w => {
    if (excludeOneLetter && w.length === 1) return false;
    if (excludeTwoLetter && w.length === 2) return false;
    return true;
  });
  return new Set(filtered);
}

// Counting & Display function
function updateCounts() {
  const text = textarea.value;
  originalTextBackup = text; // keep original for download/copy original

  // Character counts
  const charCount = text.length;
  const charNoSpacesCount = text.replace(/\s/g, '').length;

  // Words array (for word count)
  const wordsArr = countWords(text, ignorePunctuationCheckbox.checked);

  // Word count
  let wordCount = wordsArr.length;

  // Sentence count (optional)
  let sentenceCount = '-';
  if (countSentencesCheckbox.checked) {
    sentenceCount = countSentences(text);
  }

  // Unique words (optional filters)
  let uniqueCount = 0;
  if (wordsArr.length > 0) {
    const uniq = uniqueWords(wordsArr, filterOneLetterCheckbox.checked, filterTwoLetterCheckbox.checked);
    uniqueCount = uniq.size;
  }

  // Update counts with spaces toggle for characters
  charCountEl.textContent = includeSpacesCheckbox.checked ? charCount : charNoSpacesCount;
  charNoSpaceCountEl.textContent = charNoSpacesCount;
  wordCountEl.textContent = wordCount;
  sentenceCountEl.textContent = sentenceCount;
  uniqueWordCountEl.textContent = uniqueCount;
}

// Copy to clipboard helper
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (e) {
    alert('Failed to copy.');
  }
}

// Download helper
function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// Case conversions
function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// Event Listeners
textarea.addEventListener('input', updateCounts);

includeSpacesCheckbox.addEventListener('change', updateCounts);
ignorePunctuationCheckbox.addEventListener('change', updateCounts);
countSentencesCheckbox.addEventListener('change', updateCounts);
filterOneLetterCheckbox.addEventListener('change', updateCounts);
filterTwoLetterCheckbox.addEventListener('change', updateCounts);

toggleOptionsBtn.addEventListener('click', () => {
  const expanded = toggleOptionsBtn.getAttribute('aria-expanded') === 'true';
  toggleOptionsBtn.setAttribute('aria-expanded', !expanded);
  moreOptionsSection.hidden = expanded;
});

copyResultsBtn.addEventListener('click', () => {
  const resultsText = 
    `Words: ${wordCountEl.textContent}\n` +
    `Characters: ${charCountEl.textContent}\n` +
    `Characters (no spaces): ${charNoSpaceCountEl.textContent}\n` +
    `Sentences: ${sentenceCountEl.textContent}\n` +
    `Unique words: ${uniqueWordCountEl.textContent}`;
  copyToClipboard(resultsText);
});

downloadResultsBtn.addEventListener('click', () => {
  const resultsText = 
    `Words: ${wordCountEl.textContent}\n` +
    `Characters: ${charCountEl.textContent}\n` +
    `Characters (no spaces): ${charNoSpaceCountEl.textContent}\n` +
    `Sentences: ${sentenceCountEl.textContent}\n` +
    `Unique words: ${uniqueWordCountEl.textContent}`;
  downloadText('results.txt', resultsText);
});

copyOriginalBtn.addEventListener('click', () => {
  copyToClipboard(originalTextBackup);
});

downloadOriginalBtn.addEventListener('click', () => {
  downloadText('original_text.txt', originalTextBackup);
});

toUppercaseBtn.addEventListener('click', () => {
  textarea.value = textarea.value.toUpperCase();
  updateCounts();
});

toLowercaseBtn.addEventListener('click', () => {
  textarea.value = textarea.value.toLowerCase();
  updateCounts();
});

toTitlecaseBtn.addEventListener('click', () => {
  textarea.value = toTitleCase(textarea.value);
  updateCounts();
});

resetBtn.addEventListener('click', () => {
  textarea.value = '';
  includeSpacesCheckbox.checked = true;
  ignorePunctuationCheckbox.checked = false;
  countSentencesCheckbox.checked = false;
  filterOneLetterCheckbox.checked = false;
  filterTwoLetterCheckbox.checked = false;
  toggleOptionsBtn.setAttribute('aria-expanded', false);
  moreOptionsSection.hidden = true;
  updateCounts();
});

// Initialize counts on page load
updateCounts();
