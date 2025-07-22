const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const mergeButton = document.getElementById('merge-btn');
const downloadLink = document.getElementById('download-link');
let selectedFiles = [];

fileInput.addEventListener('change', () => {
  selectedFiles = Array.from(fileInput.files);
  filePreview.innerHTML = "<ul>" + selectedFiles.map(file => `<li>${file.name}</li>`).join('') + "</ul>";
});

mergeButton.addEventListener('click', async () => {
  if (selectedFiles.length < 2) {
    alert('Please select at least two PDF files.');
    return;
  }

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const file of selectedFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfFile = await mergedPdf.save();
  const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  downloadLink.href = url;
  downloadLink.style.display = 'block';
});
