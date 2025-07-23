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

  // Update button label and icon accordingly
  toggleOptionsBtn.innerHTML = "";

  const textSpan = document.createElement("span");
  textSpan.className = "text";
  textSpan.textContent = expanded ? "More options " : "Less options ";
  toggleOptionsBtn.appendChild(textSpan);

  const arrowIcon = document.createElement("i");
  arrowIcon.className = "fas fa-chevron-down arrow";
  toggleOptionsBtn.appendChild(arrowIcon);
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

// Make sure options panel is collapsed on load
moreOptions.hidden = true;
toggleOptionsBtn.setAttribute("aria-expanded", "false");

// Initialize "More options" button label and icon on load
toggleOptionsBtn.innerHTML = "";

const labelSpan = document.createElement("span");
labelSpan.className = "text";
labelSpan.textContent = "More options ";
toggleOptionsBtn.appendChild(labelSpan);

const arrowIcon = document.createElement("i");
arrowIcon.className = "fas fa-chevron-down arrow";
toggleOptionsBtn.appendChild(arrowIcon);
