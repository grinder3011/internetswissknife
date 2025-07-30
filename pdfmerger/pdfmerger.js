const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");

let selectedFiles = [];

// Render the file preview list with drag & drop reorder and remove buttons
function renderPreviewList() {
  previewList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.setAttribute("draggable", "true");
    div.dataset.index = index;

    const nameDiv = document.createElement("div");
    nameDiv.className = "file-name";
    nameDiv.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove file ${file.name}`);
    removeBtn.innerHTML = "&times;";
    removeBtn.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderPreviewList();
    });

    div.appendChild(nameDiv);
    div.appendChild(removeBtn);

    // Drag and drop handlers
    div.addEventListener("dragstart", dragStart);
    div.addEventListener("dragover", dragOver);
    div.addEventListener("dragleave", dragLeave);
    div.addEventListener("drop", drop);
    div.addEventListener("dragend", dragEnd);

    previewList.appendChild(div);
  });
}

// Drag & Drop reorder variables
let dragSrcEl = null;

function dragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.index);
  this.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (this !== dragSrcEl) {
    this.classList.add("dragover");
  }
}

function dragLeave() {
  this.classList.remove("dragover");
}

function drop(e) {
  e.preventDefault();
  this.classList.remove("dragover");

  const srcIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
  const targetIndex = parseInt(this.dataset.index, 10);

  if (srcIndex === targetIndex) return;

  // Reorder files array
  const movedFile = selectedFiles.splice(srcIndex, 1)[0];
  selectedFiles.splice(targetIndex, 0, movedFile);

  renderPreviewList();
}

function dragEnd() {
  this.classList.remove("dragging");
  // Remove dragover class from all preview items
  document.querySelectorAll(".preview-item").forEach((item) => {
    item.classList.remove("dragover");
  });
}

// Handle file input change
fileInput.addEventListener("change", (event) => {
  // Append new files to existing ones, prevent duplicates by name and size
  const newFiles = Array.from(event.target.files);
  newFiles.forEach((file) => {
    if (
      !selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      )
    ) {
      selectedFiles.push(file);
    }
  });
  renderPreviewList();
});

// Handle drag & drop files on drop zone
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const dtFiles = Array.from(e.dataTransfer.files);
  dtFiles.forEach((file) => {
    if (
      file.type === "application/pdf" &&
      !selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      )
    ) {
      selectedFiles.push(file);
    }
  });
  renderPreviewList();
});

// Click on drop zone triggers file input
dropZone.addEventListener("click", () => {
  fileInput.click();
});

// Merge PDFs
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

// Reset all
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFiles = [];
  previewList.innerHTML = "";
  output.innerHTML = "";
});

/* === Usage & Disclaimer toggles and modals === */

const usageToggle = document.getElementById("usage-toggle");
const usageContent = document.getElementById("usage-content");
const disclaimerToggle = document.getElementById("disclaimer-toggle");
const disclaimerContent = document.getElementById("disclaimer-content");

const usageModal = document.getElementById("usage-modal");
const disclaimerModal = document.getElementById("disclaimer-modal");

const modalCloses = document.querySelectorAll(".modal-close");

function toggleAccordion(button, content) {
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    button.setAttribute("aria-expanded", "false");
    content.setAttribute("hidden", "");
  } else {
    button.setAttribute("aria-expanded", "true");
    content.removeAttribute("hidden");
  }
}

function openModal(modal) {
  modal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
}

// Detect screen size once on load
const isMobile = window.matchMedia("(max-width: 767px)").matches;

// Usage toggle behavior
usageToggle.addEventListener("click", () => {
  if (isMobile) {
    openModal(usageModal);
  } else {
    toggleAccordion(usageToggle, usageContent);
  }
});

// Disclaimer toggle behavior
disclaimerToggle.addEventListener("click", () => {
  if (isMobile) {
    openModal(disclaimerModal);
  } else {
    toggleAccordion(disclaimerToggle, disclaimerContent);
  }
});

// Close modal buttons
modalCloses.forEach((btn) => {
  btn.addEventListener("click", () => {
    closeModal(btn.closest(".modal"));
  });
});

// Also close modals on click outside content
[usageModal, disclaimerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});
