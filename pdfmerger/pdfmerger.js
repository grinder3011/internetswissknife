const fileInput = document.getElementById("file-input");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");
const dropZone = document.getElementById("drop-zone");

let selectedFiles = [];
let selectedIndex = null; // For click-to-swap reorder selection

// Renders the file previews with remove buttons and click-to-swap
function renderFiles() {
  previewList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    if (index === selectedIndex) {
      previewItem.classList.add("selected");
    }
    previewItem.setAttribute("tabindex", "0");
    previewItem.setAttribute("role", "button");
    previewItem.setAttribute("aria-pressed", index === selectedIndex ? "true" : "false");
    previewItem.dataset.index = index;

    // Container for file name and remove button
    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove ${file.name}`);
    removeBtn.textContent = "🗑️";

    // Remove button event
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering previewItem click
      selectedFiles.splice(index, 1);
      // Reset selection if affected
      if (selectedIndex !== null) {
        if (selectedIndex === index) {
          selectedIndex = null;
        } else if (selectedIndex > index) {
          selectedIndex--;
        }
      }
      renderFiles();
      output.innerHTML = "";
    });

    // Click-to-swap reorder logic
    previewItem.addEventListener("click", () => {
      if (selectedIndex === null) {
        // Select first file
        selectedIndex = index;
        renderFiles();
      } else if (selectedIndex === index) {
        // Deselect if clicked again
        selectedIndex = null;
        renderFiles();
      } else {
        // Swap files
        [selectedFiles[selectedIndex], selectedFiles[index]] = [selectedFiles[index], selectedFiles[selectedIndex]];
        selectedIndex = null;
        renderFiles();
        output.innerHTML = "";
      }
    });

    previewItem.appendChild(fileNameDiv);
    previewItem.appendChild(removeBtn);
    previewList.appendChild(previewItem);
  });
}

// File input change handler
fileInput.addEventListener("change", (event) => {
  const newFiles = Array.from(event.target.files).filter(f => f.type === "application/pdf");
  selectedFiles = selectedFiles.concat(newFiles);
  renderFiles();
  output.innerHTML = "";
  fileInput.value = ""; // Reset input so same files can be reselected
});

// Drag & drop upload logic
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
  if (files.length) {
    selectedFiles = selectedFiles.concat(files);
    renderFiles();
    output.innerHTML = "";
    e.dataTransfer.clearData();
  }
});

// Merge PDFs button click
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

// Reset button click
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFiles = [];
  selectedIndex = null;
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
