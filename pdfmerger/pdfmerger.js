const fileInput = document.getElementById("file-input");
const dropArea = document.getElementById("drop-area");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");

let selectedFiles = [];

function renderPreviewList() {
  previewList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "preview-item";

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-name";
    fileInfo.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.title = "Remove file";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => {
      selectedFiles.splice(index, 1);
      renderPreviewList();
      mergeBtn.disabled = selectedFiles.length < 2;
    };

    wrapper.appendChild(fileInfo);
    wrapper.appendChild(removeBtn);
    previewList.appendChild(wrapper);
  });

  mergeBtn.disabled = selectedFiles.length < 2;
}

fileInput.addEventListener("change", (event) => {
  selectedFiles = Array.from(event.target.files).filter(f => f.type === "application/pdf");
  renderPreviewList();
});

["dragenter", "dragover"].forEach(event => {
  dropArea.addEventListener(event, e => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach(event => {
  dropArea.addEventListener(event, e => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
  });
});
dropArea.addEventListener("drop", (e) => {
  const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
  selectedFiles.push(...droppedFiles);
  renderPreviewList();
});

mergeBtn.addEventListener("click", async () => {
  if (selectedFiles.length < 2) return;

  output.innerHTML = "Merging PDFs...";
  mergeBtn.disabled = true;

  const mergedPdf = await PDFLib.PDFDocument.create();
  for (const file of selectedFiles) {
    const buffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const bytes = await mergedPdf.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const sizeKB = (blob.size / 1024).toFixed(1);

  output.innerHTML = `<a href="${url}" download="merged.pdf">Download merged PDF (${sizeKB} KB)</a>`;
  mergeBtn.disabled = false;
});

resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFiles = [];
  previewList.innerHTML = "";
  output.innerHTML = "";
  mergeBtn.disabled = true;
});

// Accordion and modal toggle
const usageToggle = document.getElementById("usage-toggle");
const usageContent = document.getElementById("usage-content");
const disclaimerToggle = document.getElementById("disclaimer-toggle");
const disclaimerContent = document.getElementById("disclaimer-content");

const usageModal = document.getElementById("usage-modal");
const disclaimerModal = document.getElementById("disclaimer-modal");

const modalCloses = document.querySelectorAll(".modal-close");

function toggleAccordion(button, content) {
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", !expanded);
  content.hidden = expanded;
}

function openModal(modal) {
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

const isMobile = window.matchMedia("(max-width: 767px)").matches;

usageToggle.addEventListener("click", () => {
  isMobile ? openModal(usageModal) : toggleAccordion(usageToggle, usageContent);
});

disclaimerToggle.addEventListener("click", () => {
  isMobile ? openModal(disclaimerModal) : toggleAccordion(disclaimerToggle, disclaimerContent);
});

modalCloses.forEach((btn) => {
  btn.addEventListener("click", () => {
    closeModal(btn.closest(".modal"));
  });
});

[usageModal, disclaimerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });
});
