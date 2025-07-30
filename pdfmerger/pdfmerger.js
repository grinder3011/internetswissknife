const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");

let selectedFiles = [];
let selectedIndicesForSwap = [];

// Render the list of selected files
function renderPreview() {
  previewList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.setAttribute("data-index", index);
    div.setAttribute("tabindex", "0");
    div.setAttribute("role", "button");
    div.setAttribute("aria-pressed", "false");

    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove file ${file.name}`);
    removeBtn.innerHTML = "×";

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFiles.splice(index, 1);
      selectedIndicesForSwap = [];
      renderPreview();
    });

    div.appendChild(fileNameDiv);
    div.appendChild(removeBtn);

    // Swap selection logic
    div.addEventListener("click", () => {
      toggleSelectForSwap(index, div);
    });

    previewList.appendChild(div);
  });
}

// Toggle selecting files for swapping
function toggleSelectForSwap(index, element) {
  const idxInSelected = selectedIndicesForSwap.indexOf(index);

  if (idxInSelected > -1) {
    // Deselect
    selectedIndicesForSwap.splice(idxInSelected, 1);
    element.classList.remove("selected");
    element.setAttribute("aria-pressed", "false");
  } else {
    // Select
    if (selectedIndicesForSwap.length < 2) {
      selectedIndicesForSwap.push(index);
      element.classList.add("selected");
      element.setAttribute("aria-pressed", "true");
    }
  }

  if (selectedIndicesForSwap.length === 2) {
    swapFiles(selectedIndicesForSwap[0], selectedIndicesForSwap[1]);
    selectedIndicesForSwap = [];
    clearSelectionAria();
  }
}

function clearSelectionAria() {
  const items = previewList.querySelectorAll(".preview-item");
  items.forEach((el) => {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed", "false");
  });
}

// Animate swap to give visual feedback
function animateSwap(el1, el2, callback) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  const deltaX = rect2.left - rect1.left;
  const deltaY = rect2.top - rect1.top;

  el1.style.transition = "transform 0.3s ease";
  el2.style.transition = "transform 0.3s ease";

  el1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  el2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

  // After animation ends
  setTimeout(() => {
    el1.style.transition = "";
    el2.style.transition = "";
    el1.style.transform = "";
    el2.style.transform = "";
    callback();
  }, 300);
}

function swapFiles(index1, index2) {
  if (index1 === index2) return;

  const el1 = previewList.querySelector(`.preview-item[data-index="${index1}"]`);
  const el2 = previewList.querySelector(`.preview-item[data-index="${index2}"]`);

  animateSwap(el1, el2, () => {
    // Swap data in array
    [selectedFiles[index1], selectedFiles[index2]] = [selectedFiles[index2], selectedFiles[index1]];
    renderPreview();
  });
}

// File input change handler
fileInput.addEventListener("change", (event) => {
  selectedFiles = selectedFiles.concat(Array.from(event.target.files));
  renderPreview();
});

// Drop zone drag & drop
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
  const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
  selectedFiles = selectedFiles.concat(files);
  renderPreview();
});

dropZone.addEventListener("click", () => {
  fileInput.click();
});

// Merge button
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
  selectedIndicesForSwap = [];
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

// Close modals on click outside content
[usageModal, disclaimerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});
