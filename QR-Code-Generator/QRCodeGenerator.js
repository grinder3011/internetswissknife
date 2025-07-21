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
    if (qrCode) {
      qrCode.clear();
    }
    return;
  }

  // Clear previous QR code container content
  qrCodeContainer.innerHTML = "";

  // Prepare logo config if any
  const logoConfig = logoImage
    ? {
        image: logoImage,
        width: 50,
        height: 50,
        // borderRadius: 10,
        // opacity: 0.8,
      }
    : undefined;

  // Destroy old qrCode instance before creating new
  if (qrCode) {
    qrCode.clear();
  }

  qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: text,
    image: logoConfig?.image || "",
    dotsOptions: {
      color: colorDarkInput.value,
      type: getSelectedStyle(), // "dots" or "square"
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
  // Reset form controls
  styleRadios.forEach(radio => {
    radio.checked = radio.value === "square";
  });
  colorDarkInput.value = "#000000";
  colorLightInput.value = "#ffffff";
  formatSelect.value = "png";
  logoUpload.value = "";
  logoImage = null;
}

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

// Event listeners
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

toggleOptionsBtn.addEventListener("click", () => {
  const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  toggleOptionsBtn.setAttribute("aria-expanded", String(!expanded));
  moreOptions.hidden = expanded;

  toggleOptionsBtn.firstChild.textContent = expanded ? "More options " : "Less options ";

  // Append arrow back because changing textContent removes children
  toggleOptionsBtn.appendChild(toggleOptionsBtn.querySelector(".arrow"));
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
