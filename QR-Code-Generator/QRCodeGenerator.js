const qrCodeContainer = document.getElementById("qrcode");
const input = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const toggleMoreBtn = document.getElementById("toggle-more-options");
const moreOptions = document.getElementById("more-options");
const styleRadios = document.querySelectorAll('input[name="style"]');
const colorDarkInput = document.getElementById("color-dark");
const colorLightInput = document.getElementById("color-light");
const formatSelect = document.getElementById("format");
const logoUrlInput = document.getElementById("logo-url");

let qrCode = null;

// Initialize QR code with default options
function createQRCode() {
  if (!input.value.trim()) {
    qrCodeContainer.innerHTML = "";
    downloadBtn.disabled = true;
    return;
  }

  // Get style
  const style = [...styleRadios].find(r => r.checked)?.value || "square";

  // Compose options for qr-code-styling
  const options = {
    width: 256,
    height: 256,
    data: input.value.trim(),
    image: logoUrlInput.value.trim() || undefined,
    dotsOptions: {
      color: colorDarkInput.value,
      type: style === "dots" ? "dots" : "square",
    },
    backgroundOptions: {
      color: colorLightInput.value,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
      imageSize: 0.15,
      hideBackgroundDots: true,
    },
  };

  // Clear previous
  qrCodeContainer.innerHTML = "";

  qrCode = new QRCodeStyling(options);

  qrCode.append(qrCodeContainer);
  downloadBtn.disabled = false;
}

generateBtn.addEventListener("click", () => {
  createQRCode();
});

// Download QR code as selected format
downloadBtn.addEventListener("click", async () => {
  if (!qrCode) return;
  const format = formatSelect.value || "png";
  try {
    await qrCode.download({ extension: format });
  } catch (e) {
    alert("Failed to download QR code: " + e.message);
  }
});

// Toggle more options panel
toggleMoreBtn.addEventListener("click", () => {
  const expanded = toggleMoreBtn.getAttribute("aria-expanded") === "true";
  toggleMoreBtn.setAttribute("aria-expanded", !expanded);
  moreOptions.hidden = expanded;
});

// Automatically update QR code when options change, if code exists
[colorDarkInput, colorLightInput, formatSelect, logoUrlInput, ...styleRadios].forEach((el) => {
  el.addEventListener("change", () => {
    if (qrCode) createQRCode();
  });
});
