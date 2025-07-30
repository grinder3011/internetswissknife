const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");

let selectedFiles = [];

// Render the file list with remove buttons and drag handlers
function renderFiles() {
  previewList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.setAttribute("draggable", "true");
    item.dataset.index = index;

    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove ${file.name}`);
    removeBtn.innerHTML = "🗑️";

    removeBtn.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderFiles();
      output.innerHTML = "";
    });

    item.appendChild(fileNameDiv);
    item.appendChild(removeBtn);
    previewList.appendChild(item);
  });

  addDragAndDropListeners();
}

// Add files from input or drop zone
fileInput.addEventListener("change", (e) => {
  selectedFiles = selectedFiles.concat(Array.from(e.target.files));
  renderFiles();
});

dropZone.addEventListener("click", () => {
  fileInput.click();
});

// Drag & drop reorder support
let dragSrcEl = null;
let dragSrcIndex = null;

function addDragAndDropListeners() {
  const items = previewList.querySelectorAll(".preview-item");

  items.forEach((item) => {
    item.addEventListener("pointerdown", dragStart);
    item.addEventListener("pointerup", dragEnd);
    item.addEventListener("pointercancel", dragEnd);
    item.addEventListener("pointermove", dragMove);

    // Prevent native drag for touch devices
    item.addEventListener("dragstart", (e) => e.preventDefault());
  });
}

function dragStart(e) {
  dragSrcEl = e.currentTarget;
  dragSrcIndex = Number(dragSrcEl.dataset.index);
  dragSrcEl.setPointerCapture(e.pointerId);
  dragSrcEl.classList.add("dragging");
}

function dragMove(e) {
  if (!dragSrcEl) return;

  const rect = previewList.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const items = [...previewList.querySelectorAll(".preview-item:not(.dragging)")];

  let targetItem = null;
  for (const item of items) {
    const itemRect = item.getBoundingClientRect();
    const itemTop = itemRect.top - rect.top;
    const itemBottom = itemTop + itemRect.height;
    if (y > itemTop && y < itemBottom) {
      targetItem = item;
      break;
    }
  }

  if (targetItem && targetItem !== dragSrcEl) {
    const targetIndex = Number(targetItem.dataset.index);

    // Reorder files array
    selectedFiles.splice(targetIndex, 0, selectedFiles.splice(dragSrcIndex, 1)[0]);
    dragSrcIndex = targetIndex;

    renderFiles();
  }
}

function dragEnd(e) {
  if (!dragSrcEl) return;
  dragSrcEl.classList.remove("dragging");
  dragSrcEl.releasePointerCapture(e.pointerId);
  dragSrcEl = null;
  dragSrcIndex = null;
  output.innerHTML = "";
}

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

// Reset button
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

// Close modals on click outside modal content
[usageModal, disclaimerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});
