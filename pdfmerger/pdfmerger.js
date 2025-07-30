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
    if (!selectedFiles.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
      selectedFiles.push(file);
    }
  });

  renderPreview();
  fileInput.value = "";
});

function renderPreview() {
  previewList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.setAttribute("data-index", index);
    div.setAttribute("tabindex", 0);

    if (selectedIndicesForSwap.includes(index)) {
      div.classList.add("selected");
    }

    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = `${index + 1}. ${file.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove file ${file.name}`);
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFiles.splice(index, 1);
      selectedIndicesForSwap = selectedIndicesForSwap.filter(i => i !== index).map(i => (i > index ? i - 1 : i));
      renderPreview();
    });

    div.appendChild(fileNameDiv);
    div.appendChild(removeBtn);

    div.addEventListener("click", () => {
      handleSwapSelection(index);
    });

    previewList.appendChild(div);
  });
}

function handleSwapSelection(index) {
  if (selectedIndicesForSwap.includes(index)) {
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

function swapFiles(i1, i2) {
  if (i1 === i2) return;

  const items = previewList.querySelectorAll(".preview-item");
  if (items.length <= Math.max(i1, i2)) return;

  const item1 = items[i1];
  const item2 = items[i2];

  // Get positions before the swap
  const rect1 = item1.getBoundingClientRect();
  const rect2 = item2.getBoundingClientRect();

  const deltaX = rect2.left - rect1.left;
  const deltaY = rect2.top - rect1.top;

  // Clone elements for animation overlay
  const clone1 = item1.cloneNode(true);
  const clone2 = item2.cloneNode(true);

  // Set absolute positions for clones
  [clone1, clone2].forEach((clone, idx) => {
    const original = idx === 0 ? item1 : item2;
    const rect = original.getBoundingClientRect();
    clone.style.position = "absolute";
    clone.style.top = `${rect.top + window.scrollY}px`;
    clone.style.left = `${rect.left + window.scrollX}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = "1000";
    clone.style.pointerEvents = "none";
    clone.style.transition = "transform 300ms ease";
    document.body.appendChild(clone);
  });

  // Animate them to each other's position
  requestAnimationFrame(() => {
    clone1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    clone2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
  });

  // Wait for animation to finish, then swap data and re-render
  setTimeout(() => {
    [selectedFiles[i1], selectedFiles[i2]] = [selectedFiles[i2], selectedFiles[i1]];
    renderPreview();
    clone1.remove();
    clone2.remove();
  }, 300);
}

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

resetBtn.addEventListener("click", () => {
  selectedFiles = [];
  selectedIndicesForSwap = [];
  previewList.innerHTML = "";
  output.innerHTML = "";
  fileInput.value = "";
});

renderPreview();

/* === Modal Handling === */
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

const isMobile = window.matchMedia("(max-width: 767px)").matches;

usageToggle.addEventListener("click", () => {
  if (isMobile) {
    openModal(usageModal);
  } else {
    toggleAccordion(usageToggle, usageContent);
  }
});

disclaimerToggle.addEventListener("click", () => {
  if (isMobile) {
    openModal(disclaimerModal);
  } else {
    toggleAccordion(disclaimerToggle, disclaimerContent);
  }
});

modalCloses.forEach((btn) => {
  btn.addEventListener("click", () => {
    closeModal(btn.closest(".modal"));
  });
});

[usageModal, disclaimerModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});
