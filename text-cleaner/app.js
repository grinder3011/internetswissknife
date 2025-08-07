// Elements
const modeRadios = document.querySelectorAll('input[name="mode"]');
const fileInputSection = document.getElementById('fileInputSection');
const textInputSection = document.getElementById('textInputSection');
const textFileSection = document.getElementById('textFileSection');
const processBtn = document.getElementById('processBtn');
const removeSpecials = document.getElementById('removeSpecials');
const fileInput = document.getElementById('fileInput');
const textInput = document.getElementById('textInput');
const textFileInput = document.getElementById('textFileInput');

// Mode Switching
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.mode-section').forEach(section => section.classList.add('hidden'));
    const selected = document.querySelector('input[name="mode"]:checked').value;
    document.getElementById(selected + 'Section').classList.remove('hidden');
  });
});

// Transliteration/Cleaning Rules
function transliterate(str) {
  const map = {
    // Czech
    'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', 'ř': 'r', 'š': 's', 'ť': 't', 'ž': 'z',
    // Hungarian
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u',
    // Scandinavian
    'å': 'a', 'ä': 'a', 'ö': 'o', 'ø': 'o', 'æ': 'ae',
    // Uppercase
    'Č': 'C', 'Ď': 'D', 'Ě': 'E', 'Ň': 'N', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ž': 'Z',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O', 'Ú': 'U', 'Ü': 'U', 'Ű': 'U',
    'Å': 'A', 'Ä': 'A', 'Ø': 'O', 'Æ': 'AE'
  };

  return str
    .split('')
    .map(char => map[char] || char)
    .join('');
}

function cleanString(str, removeExtra) {
  let cleaned = transliterate(str);
  if (removeExtra) {
    cleaned = cleaned.replace(/[^a-zA-Z0-9\-_. ]/g, '');
  }
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// File processing with JSZip
processBtn.addEventListener('click', async () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const remove = removeSpecials.checked;

  if (mode === 'filenames') {
    const files = fileInput.files;
    if (!files.length) return alert('Please upload some files first.');

    const zip = new JSZip();
    for (let file of files) {
      const cleanedName = cleanString(file.name, remove);
      const blob = await file.arrayBuffer();
      zip.file(cleanedName, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'renamed_files.zip';
    a.click();
  }

  if (mode === 'textinput') {
    const text = textInput.value;
    if (!text.trim()) return alert('Please enter some text.');
    const cleaned = text
      .split('\n')
      .map(line => cleanString(line, remove))
      .join('\n');
    downloadText(cleaned, 'cleaned-text.txt');
  }

  if (mode === 'textfile') {
    const file = textFileInput.files[0];
    if (!file) return alert('Please upload a .txt file first.');
    const content = await file.text();
    const cleaned = content
      .split('\n')
      .map(line => cleanString(line, remove))
      .join('\n');
    downloadText(cleaned, 'cleaned-textfile.txt');
  }
});

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
