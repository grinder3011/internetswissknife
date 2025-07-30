const fileInput = document.getElementById("file-input");
const previewList = document.getElementById("preview-list");
const output = document.getElementById("output");
const mergeBtn = document.getElementById("merge-btn");
const resetBtn = document.getElementById("reset-btn");

let selectedFiles = [];
let selectedIndicesForSwap = [];

// Handle file input change event
fileInput.addEventListener("change", (event) => {
  const newFiles = Array.from(event.target.files);
  newFiles.forEach((file) => {
    // Avoid duplicate files by checking name, size, lastModified
    if (!selectedFiles.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
      selectedFiles.push(file);
    }
  });

  renderPreview();

  // Reset input so selecting same files again fires event
  fileInput.value = "";
});

// Render the preview list with files
function renderPreview() {
  previewList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.setAttribute("data-index", index);
    div.setAttribute("tabindex", 0); // accessibility

    // Add swap selection styling if selected
    if (selectedIndicesForSwap.includes(index)) {
      div.classList.add("selected");
    }

    // File name container
    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = `${index + 1}. ${file.name}`;

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove file ${file.name}`);
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFiles.splice(index, 1);
      // Also clear swap selection if affected
      selectedIndicesForSwap = selectedIndicesForSwap.filter(i => i !== index).map(i => (i > index ? i - 1 : i));
      renderPreview();
    });

    div.appendChild(fileNameDiv);
    div.appendChild(removeBtn);

    // Add click event for swapping selection on mobile and desktop
    div.addEventListener("click", () => {
      handleSwapSelection(index);
    });

    previewList.appendChild(div);
  });
}

// Handle swapping logic: select two files to swap positions
function handleSwapSelection(index) {
  if (selectedIndicesForSwap.includes(index)) {
    // Deselect if already selected
    selectedIndicesForSwap = selectedIndicesForSwap.filter(i => i !== index);
  } else {
    if (selectedIndicesForSwap.length < 2) {
      selectedIndicesForSwap.push(index);
    }
    if (selectedIndicesForSwap.length === 2) {
      swapFiles(selectedIndicesForSwap[0], selectedIndicesForSwap[1]);
      selectedIndicesForSwap = [];
    }
  }
  renderPreview();
}

// Swap two files in selectedFiles array and update UI with animation
function swapFiles(i1, i2) {
  if (i1 === i2) return;
  [selectedFiles[i1], selectedFiles[i2]] = [selectedFiles[i2], selectedFiles[i1]];
  animateSwap(i1, i2);
}

// Animate a slight move to show swapping visually
function animateSwap(i1, i2) {
  renderPreview(); // Render updated order first

  const items = previewList.querySelectorAll(".preview-item");
  if (items.length <= Math.max(i1, i2)) return;

  const item1 = items[i1];
  const item2 = items[i2];

  // Add animation class
  item1.classList.add("swap-animate");
  item2.classList.add("swap-animate");

  // Remove animation class after animation duration
  setTimeout(() => {
    item1.classList.remove("swap-animate");
    item2.classList.remove("swap-animate");
  }, 300);
}

// Merge button click handler
mergeBtn.addEventListener("click", async () => {
  if (selectedFiles.length < 2) {
    alert("Please select at least 2 PDF files to merge.");
    return;
  }

  output.innerHTML = "Merging...";

  try {
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
  } catch (error) {
    output.textContent = "Error merging PDFs.";
    console.error(error);
  }
});

// Reset button clears everything
resetBtn.addEventListener("click", () => {
  selectedFiles = [];
  selectedIndicesForSwap = [];
  previewList.innerHTML = "";
  output.innerHTML = "";
  fileInput.value = "";
});

// Initial render (empty)
renderPreview();

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
