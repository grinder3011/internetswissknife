const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrCodeContainer = document.getElementById("qrcode");

const toggleOptionsBtn = document.getElementById("toggle-options-btn");
const moreOptions = document.getElementById("more-options");

const styleRadios = document.querySelectorAll('input[name="style"]');
const colorDarkInput = document.getElementById("color-dark");
const colorLightInput = document.getElementById("color-light");
const formatSelect = document.getElementById("format");
const logoUpload = document.getElementById("logo-upload");
const resetBtn = document.getElementById("reset-btn");

// Tooltip elements
const tooltipToggleBtn = document.getElementById("tooltip-toggle");
const tooltipPanel = document.getElementById("tooltip-panel");
const tooltipCloseBtn = document.getElementById("tooltip-close");

let qrCode = null;
let logoImage = null;

function getSelectedStyle() {
  for (const radio of styleRadios) {
    if (radio.checked) return radio.value;
  }
  return "square";
}

function createQRCode() {
  const text = qrInput.value.trim();
  if (!text) {
    qrCodeContainer.innerHTML = "<p style='color:#999'>Enter text or URL to generate QR code</p>";
    qrCode = null;
    return;
  }

  // Clear previous QR code container content and old qrCode instance
  qrCodeContainer.innerHTML = "";
  qrCode = null;

  const logoConfig = logoImage
    ? {
        image: logoImage,
        width: 50,
        height: 50,
      }
    : undefined;

  qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: text,
    image: logoConfig?.image || "",
    dotsOptions: {
      color: colorDarkInput.value,
      type: getSelectedStyle(),
    },
    backgroundOptions: {
      color: colorLightInput.value,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
      imageSize: 0.15,
    },
  });

  qrCode.append(qrCodeContainer);
}

function resetSettings() {
  styleRadios.forEach(radio => {
    radio.checked = radio.value === "square";
  });
  colorDarkInput.value = "#000000";
  colorLightInput.value = "#ffffff";
  formatSelect.value = "png";
  logoUpload.value = "";
  logoImage = null;
}

// Logo upload handler
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    logoImage = null;
    createQRCode();
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    logoImage = e.target.result;
    createQRCode();
  };
  reader.readAsDataURL(file);
}

// More options toggle handler
toggleOptionsBtn.addEventListener("click", () => {
  const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  toggleOptionsBtn.setAttribute("aria-expanded", String(!expanded));
  moreOptions.hidden = expanded;

  // Update button text with arrow
  const spanText = toggleOptionsBtn.querySelector("span.text");
  if (spanText) {
    spanText.textContent = expanded ? "More options " : "Less options ";
  } else {
    // fallback in case span.text is missing
    toggleOptionsBtn.textContent = expanded ? "More options " : "Less options ";
  }

  // Remove existing arrow span if any to avoid duplicates
  const existingArrow = toggleOptionsBtn.querySelector("span.arrow");
  if (existingArrow) existingArrow.remove();

  // Append arrow span
  const arrow = document.createElement("span");
  arrow.className = "arrow";
  arrow.textContent = expanded ? "▼" : "▲";
  toggleOptionsBtn.appendChild(arrow);
});

// Tooltip toggle handler
tooltipToggleBtn.addEventListener("click", () => {
  if (tooltipPanel.hidden) {
    tooltipPanel.hidden = false;
    tooltipToggleBtn.setAttribute("aria-expanded", "true");
  } else {
    tooltipPanel.hidden = true;
    tooltipToggleBtn.setAttribute("aria-expanded", "false");
  }
});

// Tooltip close button handler
tooltipCloseBtn.addEventListener("click", () => {
  tooltipPanel.hidden = true;
  tooltipToggleBtn.setAttribute("aria-expanded", "false");
});

// QR code related event listeners
generateBtn.addEventListener("click", () => {
  createQRCode();
});

downloadBtn.addEventListener("click", () => {
  if (!qrCode) return;

  const format = formatSelect.value;
  qrCode.download({
    extension: format,
  });
});

styleRadios.forEach(radio => radio.addEventListener("change", createQRCode));
colorDarkInput.addEventListener("input", createQRCode);
colorLightInput.addEventListener("input", createQRCode);
logoUpload.addEventListener("change", handleLogoUpload);

resetBtn.addEventListener("click", () => {
  resetSettings();
  createQRCode();
});

// On page load
resetSettings();
createQRCode();
