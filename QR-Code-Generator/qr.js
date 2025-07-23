// Basic QR Code Styling init and event logic

const qrCodeContainer = document.getElementById('qrcode');
const input = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const toggleOptionsBtn = document.getElementById('toggle-options-btn');
const moreOptionsSection = document.getElementById('more-options');

const tooltipToggleBtn = document.getElementById('tooltip-toggle');
const tooltipPanel = document.getElementById('tooltip-panel');
const tooltipCloseBtn = document.getElementById('tooltip-close');

// Initialize QR Code Styling object
const qrCode = new QRCodeStyling({
  width: 160,
  height: 160,
  data: "",
  dotsOptions: {
    color: "#000000",
    type: "square",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 5,
  },
});

qrCode.append(qrCodeContainer);

// Helper to update QR code with current inputs
function updateQRCode() {
  const data = input.value.trim();
  if (!data) {
    qrCode.update({ data: "" });
    return;
  }

  // Style radio
  const styleValue = document.querySelector('input[name="style"]:checked').value;
  const dotsType = styleValue === "dots" ? "dots" : "square";

  // Colors
  const colorDark = document.getElementById("color-dark").value;
  const colorLight = document.getElementById("color-light").value;

  // Format
  const format = document.getElementById("format").value;

  qrCode.update({
    data,
    dotsOptions: { color: colorDark, type: dotsType },
    backgroundOptions: { color: colorLight },
    image: currentLogoDataUrl || undefined,
    imageOptions: { crossOrigin: "anonymous", margin: 5 },
    qrOptions: { errorCorrectionLevel: "Q" },
    type: format === "svg" ? "svg" : "canvas",
  });
}

// Event listeners

generateBtn.addEventListener("click", () => {
  if (!input.value.trim()) {
    alert("Please enter text or URL to generate QR code.");
    input.focus();
    return;
  }
  updateQRCode();
});

downloadBtn.addEventListener("click", () => {
  const format = document.getElementById("format").value;
  qrCode.download({ extension: format });
});

// Toggle more options
toggleOptionsBtn.addEventListener("click", () => {
  const expanded =
    toggleOptionsBtn.getAttribute("aria-expanded") === "true" ? true : false;
  if (expanded) {
    moreOptionsSection.hidden = true;
    toggleOptionsBtn.setAttribute("aria-expanded", "false");
  } else {
    moreOptionsSection.hidden = false;
    toggleOptionsBtn.setAttribute("aria-expanded", "true");
  }
});

// Reset button clears input and options
document.getElementById("reset-btn").addEventListener("click", () => {
  input.value = "";
  document.querySelector('input[name="style"][value="square"]').checked = true;
  document.getElementById("color-dark").value = "#000000";
  document.getElementById("color-light").value = "#ffffff";
  document.getElementById("format").value = "png";
  currentLogoDataUrl = null;
  document.getElementById("logo-upload").value = "";
  qrCode.update({ data: "" });
});

// Logo upload handling
let currentLogoDataUrl = null;
document
  .getElementById("logo-upload")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      currentLogoDataUrl = event.target.result;
      updateQRCode();
    };
    reader.readAsDataURL(file);
  });

// Tooltip toggle logic
tooltipToggleBtn.addEventListener("click", () => {
  if (tooltipPanel.hidden) {
    tooltipPanel.hidden = false;
    tooltipToggleBtn.setAttribute("aria-expanded", "true");
  } else {
    tooltipPanel.hidden = true;
    tooltipToggleBtn.setAttribute("aria-expanded", "false");
  }
});

tooltipCloseBtn.addEventListener("click", () => {
  tooltipPanel.hidden = true;
  tooltipToggleBtn.setAttribute("aria-expanded", "false");
});

// Close tooltip if clicked outside
document.addEventListener("click", (event) => {
  if (
    !tooltipPanel.contains(event.target) &&
    event.target !== tooltipToggleBtn
  ) {
    tooltipPanel.hidden = true;
    tooltipToggleBtn.setAttribute("aria-expanded", "false");
  }
});
