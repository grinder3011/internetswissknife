const logoUploadInput = document.getElementById("logo-upload");
const resetBtn = document.getElementById("reset-btn");

// Track current logo image data URL
let logoDataUrl = null;

// Handle logo file upload
logoUploadInput.addEventListener("change", () => {
  const file = logoUploadInput.files[0];
  if (!file) {
    logoDataUrl = null;
    createQRCode();
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    logoDataUrl = e.target.result;
    createQRCode();
  };
  reader.readAsDataURL(file);
});

// Update QR code creation function to use logoDataUrl instead of logo URL field
function createQRCode() {
  if (!input.value.trim()) {
    qrCodeContainer.innerHTML = "";
    downloadBtn.disabled = true;
    return;
  }

  const style = [...styleRadios].find(r => r.checked)?.value || "square";

  const options = {
    width: 256,
    height: 256,
    data: input.value.trim(),
    image: logoDataUrl || undefined,
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

  qrCodeContainer.innerHTML = "";

  qrCode = new QRCodeStyling(options);
  qrCode.append(qrCodeContainer);
  downloadBtn.disabled = false;
}

// Reset button resets all inputs and regenerates default QR
resetBtn.addEventListener("click", () => {
  input.value = "";
  colorDarkInput.value = "#000000";
  colorLightInput.value = "#ffffff";
  formatSelect.value = "png";
  logoUploadInput.value = null;
  logoDataUrl = null;

  // Reset style radio to square
  styleRadios.forEach(radio => {
    radio.checked = radio.value === "square";
  });

  createQRCode();
  downloadBtn.disabled = true;
});

// Listen for changes on options to auto-regenerate if QR code exists
[colorDarkInput, colorLightInput, formatSelect, ...styleRadios].forEach((el) => {
  el.addEventListener("change", () => {
    if (qrCode) createQRCode();
  });
});
