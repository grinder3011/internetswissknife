document.addEventListener('DOMContentLoaded', () => {
  const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
  const fileNamesInput = document.getElementById('fileNamesInput');
  const textInput = document.getElementById('textInput');
  const fileUpload = document.getElementById('fileUpload');
  const fileUploadInput = document.getElementById('fileUploadInput');

  const specialCharOptions = document.querySelectorAll('input[name="specialCharOption"]');
  const listedCharsInput = document.getElementById('listedCharsInput');
  const trimSpacesCheckbox = document.getElementById('trimSpacesCheckbox');
  const separatorOptions = document.getElementById('separatorOptions');
  const wordSeparatorSelect = document.getElementById('wordSeparatorSelect');

  const processButton = document.getElementById('processButton');
  const outputPreview = document.getElementById('outputPreview');
  const copyButton = document.getElementById('copyButton');
  const downloadButton = document.getElementById('downloadButton');

  // Show/hide inputs based on input type
  inputTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      fileNamesInput.style.display = radio.value === 'fileNames' ? 'block' : 'none';
      textInput.style.display = radio.value === 'textInput' ? 'block' : 'none';
      fileUpload.style.display = radio.value === 'textFile' ? 'block' : 'none';
      outputPreview.value = '';
    });
  });

  // Enable/disable listed chars input based on special char option
  specialCharOptions.forEach(opt => {
    opt.addEventListener('change', () => {
      if (opt.value === 'removeListed' && opt.checked) {
        listedCharsInput.disabled = false;
      } else {
        listedCharsInput.disabled = true;
        listedCharsInput.value = '';
      }
    });
  });

  // Show/hide separator options when trim spaces checkbox changes
  trimSpacesCheckbox.addEventListener('change', () => {
    separatorOptions.style.display = trimSpacesCheckbox.checked ? 'block' : 'none';
  });

  // Helper to remove characters from a string
  function removeChars(str, charsToRemove) {
    if (!charsToRemove) return str;
    // Create a regex that matches all chars to remove
    // Escape special regex chars in charsToRemove
    const escaped = charsToRemove.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    const regex = new RegExp(`[${escaped}]`, 'g');
    return str.replace(regex, '');
  }

  // Clean one string according to options
  function cleanString(str, options) {
    let result = str;

    if (options.removeAllSpecialChars) {
      // Remove all special chars except letters, numbers, and space
      result = result.replace(/[^a-zA-Z0-9\s]/g, '');
    } else if (options.charsToRemove) {
      result = removeChars(result, options.charsToRemove);
    }

    if (options.trimExtraSpaces) {
      // Replace multiple spaces with one
      result = result.replace(/\s+/g, ' ').trim();
    }

    if (options.insertSeparator) {
      const sep = options.separator === 'underscore' ? '_' : '-';
      // Replace spaces with selected separator
      result = result.replace(/\s+/g, sep);
    }

    return result;
  }

  // Parse listed chars input: accepts commas, spaces, or newlines as separators
  function parseListedChars(input) {
    if (!input) return '';
    return input
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .join('');
  }

  // Process input based on type and options
  async function processInput() {
    outputPreview.value = '';
    const inputType = document.querySelector('input[name="inputType"]:checked').value;
    const specialCharOption = document.querySelector('input[name="specialCharOption"]:checked').value;

    const removeAllSpecialChars = specialCharOption === 'removeAll';
    const charsToRemove = specialCharOption === 'removeListed' ? parseListedChars(listedCharsInput.value) : '';

    const trimExtraSpaces = trimSpacesCheckbox.checked;
    const insertSeparator = trimExtraSpaces;
    const separator = wordSeparatorSelect.value;

    const options = { removeAllSpecialChars, charsToRemove, trimExtraSpaces, insertSeparator, separator };

    if (inputType === 'fileNames') {
      const rawText = document.getElementById('fileNamesTextarea').value;
      if (!rawText.trim()) {
        alert('Please enter at least one file name.');
        return;
      }
      const lines = rawText.split(/\r?\n/);
      let outputLines = [];
      let logs = ['Original → Cleaned File Names:\n'];
      lines.forEach((line, idx) => {
        const cleaned = cleanString(line, options);
        outputLines.push(cleaned);
        logs.push(`${line} → ${cleaned}`);
      });
      outputPreview.value = logs.join('\n');
    } else if (inputType === 'textInput') {
      const rawText = document.getElementById('textTextarea').value;
      if (!rawText.trim()) {
        alert('Please enter some text.');
        return;
      }
      const cleaned = cleanString(rawText, options);
      outputPreview.value =
        `Original length: ${rawText.length}\nCleaned length: ${cleaned.length}\n\nCleaned Text:\n` + cleaned;
    } else if (inputType === 'textFile') {
      const files = fileUploadInput.files;
      if (!files.length) {
        alert('Please upload at least one text file.');
        return;
      }

      let logs = [];
      let outputFiles = [];

      // We will read all files and clean them
      for (const file of files) {
        if (!file.name.toLowerCase().endsWith('.txt')) {
          logs.push(`Skipped ${file.name} (not a .txt file)`);
          continue;
        }
        const text = await file.text();
        const cleaned = cleanString(text, options);
        logs.push(`${file.name} cleaned. Original length: ${text.length}, Cleaned length: ${cleaned.length}`);

        outputFiles.push({ name: file.name.replace(/\.txt$/i, '') + '_cleaned.txt', content: cleaned });
      }

      outputPreview.value = logs.join('\n');

      // Save the cleaned files for download as zip or single file
      if (outputFiles.length === 1) {
        // single file download
        prepareDownload(outputFiles[0].name, outputFiles[0].content);
      } else if (outputFiles.length > 1) {
        // multiple files: create ZIP
        await prepareZipDownload(outputFiles);
      }
    }
  }

  // Prepare download link for single file
  function prepareDownload(filename, content) {
    downloadButton.disabled = false;
    downloadButton.onclick = () => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  // Prepare zip download for multiple files
  async function prepareZipDownload(files) {
    downloadButton.disabled = true;
    downloadButton.onclick = null;

    // Load JSZip dynamically (if not loaded)
    if (!window.JSZip) {
      await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
    }
    const zip = new JSZip();
    files.forEach(f => {
      zip.file(f.name, f.content);
    });

    downloadButton.disabled = false;
    downloadButton.onclick = async () => {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_files.zip';
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  // Dynamic script loader
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  // Copy preview text to clipboard
  copyButton.addEventListener('click', () => {
    if (!outputPreview.value.trim()) return;
    navigator.clipboard.writeText(outputPreview.value).then(() => {
      alert('Copied to clipboard!');
    });
  });

  processButton.addEventListener('click', () => {
    downloadButton.disabled = true;
    downloadButton.onclick = null;
    processInput();
  });

  // Initialize
  downloadButton.disabled = true;
});
