const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const createZipBtn = document.getElementById('createZipBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

const helpPanel = document.getElementById('helpPanel');
const openHelp = document.getElementById('open-help');
const closeHelp = document.getElementById('close-help');

let zip = new JSZip();
let zipBlob = null;

fileInput.addEventListener('change', (e) => {
  zip = new JSZip(); // reset zip
  zipBlob = null; // reset blob
  fileList.innerHTML = '';

  Array.from(e.target.files).forEach(file => {
    zip.file(file.name, file);
    const listItem = document.createElement('div');
    listItem.textContent = `📄 ${file.name}`;
    fileList.appendChild(listItem);
  });
});

createZipBtn.addEventListener('click', async () => {
  if (!Object.keys(zip.files).length) {
    alert('No files selected!');
    return;
  }
  zipBlob = await zip.generateAsync({ type: 'blob' });
  alert('Archive created! Now you can download it.');
});

downloadBtn.addEventListener('click', () => {
  if (!zipBlob) {
    alert('First create the archive.');
    return;
  }

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'archive.zip';
  a.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener('click', () => {
  zip = new JSZip();
  zipBlob = null;
  fileInput.value = '';
  fileList.innerHTML = '';
});

openHelp.addEventListener('click', () => {
  helpPanel.classList.remove('hidden');
  helpPanel.classList.add('visible');
});

closeHelp.addEventListener('click', () => {
  helpPanel.classList.remove('visible');
  helpPanel.classList.add('hidden');
});
