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

const infoTooltip = document.getElementById("info-tooltip");
const instructionPanel = document.getElementById("instruction-panel");
const closeInstructionsBtn = document.getElementById("close-instructions");

let qrCode = null;
let logoImage = null;

function getSelectedStyle() {
  for (const radio of styleRadios) {
    if (radio.checked) return radio.value;
  }
  return "square";
}

function generateQRCode() {
  const data = qrInput.value.trim();
  if (!data) {
    alert("Please enter text or URL.");
    return;
  }

  const style = getSelectedStyle();
  const darkColor = colorDarkInput.value;
  const lightColor = colorLightInput.value;
  const format = formatSelect.value;

  const options = {
    width: 300,
    height: 300,
    data: data,
    image: logoImage,
    dotsOptions: {
      color: darkColor,
      type: style === "dots" ? "dots" : "square",
    },
    backgroundOptions: {
      color: lightColor,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
    },
    qrOptions: {
      errorCorrectionLevel: "Q",
    },
    // no need to set 'type' for output, handled by download method
  };

  if (qrCode) {
    qrCode.update(options);
  } else {
    qrCode = new QRCodeStyling(options);
    qrCode.append(qrCodeContainer);
  }
}

function downloadQRCode() {
  if (!qrCode) {
    alert("Generate a QR code first.");
    return;
  }
  qrCode.download({
    extension: formatSelect.value,
  });
}

function resetDefaults() {
  qrInput.value = "";
  styleRadios.forEach(r => (r.checked = r.value === "square"));
  colorDarkInput.value = "#000000";
  colorLightInput.value = "#ffffff";
  formatSelect.value = "png";
  logoUpload.value = "";
  logoImage = null;
  if (qrCode) {
    qrCode.clear();
  }
}

toggleOptionsBtn.addEventListener("click", () => {
  const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  toggleOptionsBtn.setAttribute("aria-expanded", !expanded);
  moreOptions.hidden = expanded;
});

generateBtn.addEventListener("click", () => {
  generateQRCode();
});

downloadBtn.addEventListener("click", () => {
  downloadQRCode();
});

resetBtn.addEventListener("click", () => {
  resetDefaults();
});

// Load logo image on upload
logoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    logoImage = event.target.result;
    generateQRCode();
  };
  reader.readAsDataURL(file);
});

// Tooltip and side panel

infoTooltip.addEventListener("click", () => {
  instructionPanel.classList.add("open");
  instructionPanel.setAttribute("aria-hidden", "false");
  instructionPanel.focus();
});

closeInstructionsBtn.addEventListener("click", () => {
  instructionPanel.classList.remove("open");
  instructionPanel.setAttribute("aria-hidden", "true");
  infoTooltip.focus();
});

// Allow closing panel with Escape key
instructionPanel.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    instructionPanel.classList.remove("open");
    instructionPanel.setAttribute("aria-hidden", "true");
    infoTooltip.focus();
  }
});
