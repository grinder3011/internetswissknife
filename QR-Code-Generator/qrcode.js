const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrcodeContainer = document.getElementById("qrcode");

const dotStyleSelect = document.getElementById("dot-style");
const colorDarkInput = document.getElementById("color-dark");
const colorLightInput = document.getElementById("color-light");
const formatSelect = document.getElementById("format");
const logoFileInput = document.getElementById("logo-file");

let qrCode = null;
let currentLogoDataURL = null;

// Initialize QRCodeStyling instance with defaults
function createQRCodeInstance(text) {
  return new QRCodeStyling({
    width: 256,
    height: 256,
    data: text,
    image: currentLogoDataURL,
    dotsOptions: {
      color: colorDarkInput.value,
      type: dotStyleSelect.value,
    },
    backgroundOptions: {
      color: colorLightInput.value,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
    },
  });
}

function generateQR() {
  const text = qrInput.value.trim();
  if (!text) return alert("Please enter text or URL.");

  // Clear previous QR code if any
  qrcodeContainer.innerHTML = "";

  // Create new instance
  qrCode = createQRCodeInstance(text);

  // Append generated QR code to container
  qrCode.append(qrcodeContainer);
}

function downloadQR() {
  if (!qrCode) return alert("Generate a QR code first.");
  const format = formatSelect.value;
  qrCode.download({ extension: format });
}

function readLogoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject("Failed to read logo file.");
    reader.readAsDataURL(file);
  });
}

// Update logo when user uploads new image
logoFileInput.addEventListener("change", async () => {
  const file = logoFileInput.files[0];
  if (!file) {
    currentLogoDataURL = null;
    return;
  }
  try {
    currentLogoDataURL = await readLogoFile(file);
    // Regenerate QR if text is present
    if (qrInput.value.trim()) {
      generateQR();
    }
  } catch (err) {
    alert(err);
  }
});

// Regenerate QR code when options change (only if code exists)
[dotStyleSelect, colorDarkInput, colorLightInput].forEach((input) =>
  input.addEventListener("change", () => {
    if (qrInput.value.trim()) generateQR();
  })
);

// Generate on button click
generateBtn.addEventListener("click", generateQR);

// Download on button click
downloadBtn.addEventListener("click", downloadQR);
