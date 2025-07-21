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

function createQRCode() {
  const text = qrInput.value.trim();
  if (!text) {
    qrCodeContainer.innerHTML = "";
    return;
  }

  // Get selected style
  let style = 'square';
  styleRadios.forEach(radio => {
    if (radio.checked) style = radio.value;
  });

  // Clear old qrCode if exists
  if (qrCode) {
    qrCode.clear();
  }

  // Logo config
  const logo = logoImage
    ? {
        image: logoImage,
        width: 50,
        height: 50,
        // optionally add borderRadius, opacity etc.
      }
    : undefined;

  qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: text,
    image: logo?.image || "",
    dotsOptions: {
      color: colorDarkInput.value,
      type: style === 'dots' ? "dots" : "square",
    },
    backgroundOptions: {
      color: colorLightInput.value,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
      imageSize: 0.15,
      // ... other options if needed
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

generateBtn.addEventListener("click", () => {
  qrCodeContainer.innerHTML = "";
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
  // Append arrow back (needed since firstChild.textContent wipes children)
  toggleOptionsBtn.appendChild(toggleOptionsBtn.querySelector(".arrow"));
});

styleRadios.forEach(radio => {
  radio.addEventListener("change", createQRCode);
});

colorDarkInput.addEventListener("input", createQRCode);
colorLightInput.addEventListener("input", createQRCode);
logoUpload.addEventListener("change", handleLogoUpload);
resetBtn.addEventListener("click", () => {
  resetSettings();
  createQRCode();
});

// Initialize with defaults
resetSettings();
createQRCode();
