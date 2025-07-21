// Use the QRCodeStyling library that supports dots, logos, and SVG export
// CDN link: https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js
// Make sure you include this in your project or add in the HTML head:
// <script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>

const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrcodeContainer = document.getElementById("qrcode");

const toggleOptionsBtn = document.getElementById("toggle-options-btn");
const moreOptions = document.getElementById("more-options");

const styleRadios = document.querySelectorAll('input[name="style"]');
const colorDarkInput = document.getElementById("color-dark");
const colorLightInput = document.getElementById("color-light");
const formatSelect = document.getElementById("format");
const logoUploadInput = document.getElementById("logo-upload");
const resetBtn = document.getElementById("reset-btn");

let logoDataURL = null;

const defaultSettings = {
  data: "",
  width: 256,
  height: 256,
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
  image: "",
  type: "png",
};

let qrCode = new QRCodeStyling(defaultSettings);

// Append QR code canvas/svg element to container
function renderQRCode() {
  qrcodeContainer.innerHTML = "";
  qrCode.append(qrcodeContainer);
}

function updateQRCode() {
  const data = qrInput.value.trim();
  if (!data) {
    qrcodeContainer.innerHTML = "";
    return;
  }

  const selectedStyle = [...styleRadios].find((r) => r.checked).value;
  const darkColor = colorDarkInput.value;
  const lightColor = colorLightInput.value;
  const format = formatSelect.value;

  qrCode.update({
    data,
    dotsOptions: {
      color: darkColor,
      type: selectedStyle,
    },
    backgroundOptions: {
      color: lightColor,
    },
    image: logoDataURL || "",
    type: format,
  });

  renderQRCode();
}

// Logo Upload handling
logoUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    logoDataURL = null;
    updateQRCode();
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    logoDataURL = event.target.result;
    updateQRCode();
  };
  reader.readAsDataURL(file);
});

// Generate button
generateBtn.addEventListener("click", () => {
  updateQRCode();
});

// Download button
downloadBtn.addEventListener("click", () => {
  qrCode.download(formatSelect.value);
});

// Toggle more options
toggleOptionsBtn.addEventListener("click", () => {
  const expanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
  toggleOptionsBtn.setAttribute("aria-expanded", String(!expanded));
  if (expanded) {
    moreOptions.hidden = true;
    toggleOptionsBtn.textContent = "More Options ▼";
  } else {
    moreOptions.hidden = false;
    toggleOptionsBtn.textContent = "Less Options ▲";
  }
});

// Reset to default settings
resetBtn.addEventListener("click", () => {
  qrInput.value = "";
  styleRadios.forEach((r) => (r.checked = r.value === "square"));
  colorDarkInput.value = "#000000";
  colorLightInput.value = "#ffffff";
  formatSelect.value = "png";
  logoUploadInput.value = "";
  logoDataURL = null;
  qrcodeContainer.innerHTML = "";
  toggleOptionsBtn.setAttribute("aria-expanded", "false");
  moreOptions.hidden = true;
  toggleOptionsBtn.textContent = "More Options ▼";
});

renderQRCode();
