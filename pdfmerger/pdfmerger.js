const fileInput = document.getElementById("file-input");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");

let selectedFiles = [];

fileInput.addEventListener("change", (event) => {
  selectedFiles = Array.from(event.target.files);
  previewList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.textContent = `${index + 1}. ${file.name}`;
    previewList.appendChild(div);
  });
});

mergeBtn.addEventListener("click", async () => {
  if (selectedFiles.length < 2) {
    alert("Please select at least 2 PDF files to merge.");
    return;
  }

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const file of selectedFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  output.innerHTML = `<a href="${url}" download="merged.pdf">Download Merged PDF</a>`;
});

resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFiles = [];
  previewList.innerHTML = "";
  output.innerHTML = "";
});
