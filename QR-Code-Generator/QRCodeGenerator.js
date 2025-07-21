let qrInstance = null;
let logoImage = null;

const qrContainer = document.getElementById("qrcode");
const inputEl = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");

const toggleMoreBtn = document.querySelector(".toggle-more-btn");
const moreOptions = document.getElementById("more-options");

const styleRadios = document.querySelectorAll('input[name="style"]');
const formatRadios = document.querySelectorAll('input[name="format"]');
const colorDarkInput = document.getElementById("color-dark");
const colorLightInput = document.getElementById("color-light");

const logoUpload = document.getElementById("logo-upload");
const logoPreview = document.getElementById("logo-preview");

// Toggle More Options panel
toggleMoreBtn.addEventListener("click", () => {
  const expanded = toggleMoreBtn.getAttribute("aria-expanded") === "true";
  toggleMoreBtn.setAttribute("aria-expanded", !expanded);
  if (!expanded) {
    moreOptions.removeAttribute("hidden");
  } else {
    moreOptions.setAttribute("hidden", "");
  }
});

// Load logo image from input
logoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  logoPreview.innerHTML = "";
  logoImage = null;

  if (file) {
    const img = document.createElement("img");
    img.alt = "Logo preview";
    img.style.maxHeight = "50px";
    img.style.maxWidth = "100%";
    img.style.objectFit = "contain";

    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
      logoPreview.appendChild(img);
      logoImage = img;
    };
    reader.readAsDataURL(file);
  }
});

function getSelectedRadioValue(nodeList) {
  for (const radio of nodeList) {
    if (radio.checked) return radio.value;
  }
  return null;
}

function clearQR() {
  qrContainer.innerHTML = "";
  qrInstance = null;
  downloadBtn.disabled = true;
}

function generateQR() {
  const text = inputEl.value.trim();
  if (!text) {
    clearQR();
    return;
  }

  clearQR();

  // QR Code config
  const style = getSelectedRadioValue(styleRadios);
  const format = getSelectedRadioValue(formatRadios);
  const colorDark = colorDarkInput.value;
  const colorLight = colorLightInput.value;

  // Prepare options for QRCode.js
  // We will generate PNG or SVG based on format
  // QRCode.js library (qrcodejs2) supports canvas (PNG) and SVG (if specified)

  const qrOptions = {
    text: text,
    width: 256,
    height: 256,
    colorDark: colorDark,
    colorLight: colorLight,
    correctLevel: QRCode.CorrectLevel.H,
    useSVG: format === "svg",
  };

  // Create QR code
  qrInstance = new QRCode(qrContainer, qrOptions);

  // After a short delay, add logo & apply style
  setTimeout(() => {
    applyStyle(style);
    if (logoImage) addLogo(logoImage);
    downloadBtn.disabled = false;
  }, 100);
}

// Apply style: 'square' or 'dots' (dots are simulated by modifying canvas pixels or SVG circles)
function applyStyle(style) {
  if (!qrInstance) return;
  const container = qrContainer;

  // Clear previous style adjustments
  // Remove any existing style overlays or classes
  container.querySelectorAll(".qr-dot, .qr-square").forEach(el => el.remove());

  // The qrcodejs2 library doesn't support "dots" style out of the box,
  // so we'll do a simple workaround by replacing squares with circles in SVG,
  // or for canvas we will skip style because it's complicated.

  const format = getSelectedRadioValue(formatRadios);

  if (format === "svg" && style === "dots") {
    // Find all rect elements in SVG and replace with circles
    const svg = container.querySelector("svg");
    if (!svg) return;

    // Get all rect elements representing modules
    const rects = svg.querySelectorAll("rect");

    rects.forEach(rect => {
      const cx = +rect.getAttribute("x") + (+rect.getAttribute("width") / 2);
      const cy = +rect.getAttribute("y") + (+rect.getAttribute("height") / 2);
      const r = +rect.getAttribute("width") / 2;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", rect.getAttribute("fill"));

      rect.parentNode.replaceChild(circle, rect);
    });
  }
  // For canvas (PNG), dots style is not supported - fallback to square
}

function addLogo(img) {
  if (!qrInstance || !img) return;

  const container = qrContainer;
  const format = getSelectedRadioValue(formatRadios);

  if (format === "svg") {
    const svg = container.querySelector("svg");
    if (!svg) return;

    // Remove old logo group if any
    const oldLogo = svg.querySelector("#qr-logo");
    if (oldLogo) oldLogo.remove();

    // Add <image> element for logo at center
    const svgNS = "http://www.w3.org/2000/svg";

    const logoGroup = document.createElementNS(svgNS, "g");
    logoGroup.setAttribute("id", "qr-logo");

    const logoSize = 50;
    const center = 128; // half of 256

    const imageElem = document.createElementNS(svgNS, "image");
    imageElem.setAttributeNS(null, "href", img.src);
    imageElem.setAttribute("x", center - logoSize / 2);
    imageElem.setAttribute("y", center - logoSize / 2);
    imageElem.setAttribute("width", logoSize);
    imageElem.setAttribute("height", logoSize);
    imageElem.setAttribute("style", "border-radius: 12px;");

    logoGroup.appendChild(imageElem);
    svg.appendChild(logoGroup);

  } else if (format === "png") {
    // For canvas: redraw QR code on canvas and overlay logo
    const canvas = container.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const logoSize = 50;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Wait a tick to ensure QR code is drawn
    setTimeout(() => {
      // Draw logo image on top, centered
      ctx.drawImage(img, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
    }, 20);
  }
}

// Download QR code image
function downloadQR() {
  if (!qrInstance) return;

  const format = getSelectedRadioValue(formatRadios);
  const container = qrContainer;

  if (format === "svg") {
    const svg = container.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // Add name spaces if missing
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

  } else {
    // PNG canvas download
    const img = container.querySelector("canvas");
    if (!img) return;

    const a = document.createElement("a");
    a.href = img.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  }
}

// Event listeners
generateBtn.addEventListener("click", generateQR);
downloadBtn.addEventListener("click", downloadQR);

// Support "Enter" key on input to generate
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    generateQR();
  }
});

// Regenerate QR code when options change
[...styleRadios, ...formatRadios, colorDarkInput, colorLightInput].forEach(el => {
  el.addEventListener("change", () => {
    if (inputEl.value.trim()) generateQR();
  });
});
