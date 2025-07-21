const input = document.getElementById('pdf-input');
const fileList = document.getElementById('file-list');
const mergeBtn = document.getElementById('merge-btn');

let pdfFiles = [];

input.addEventListener('change', () => {
  pdfFiles = Array.from(input.files);
  fileList.innerHTML = '';

  pdfFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.textContent = `${index + 1}. ${file.name}`;
    fileList.appendChild(item);
  });
});

mergeBtn.addEventListener('click', async () => {
  if (pdfFiles.length < 2) {
    alert('Please select at least 2 PDF files to merge.');
    return;
  }

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const file of pdfFiles) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'merged.pdf';
  a.click();
  URL.revokeObjectURL(url);
});
