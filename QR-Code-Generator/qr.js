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
    qrCodeContainer.innerHTML =
      "<p style='color:#999'>Enter text or URL to generate QR code</p>";
    qrCode = null;
    return;
  }

  // Clear previous QR code and reset reference
  qrCodeContainer.innerHTML = "";
  qrCode = null;

  const logoConfig = logoImage
    ? {
        image: logoImage,
        width: 50,
        height: 50,
      }
    : undefined;

  // Map "extra-dots" style to a valid type for QRCodeStyling:
  // Using "classy" here as an example variant for extra dots.
  let dotsType;
  switch (getSelectedStyle()) {
    case "square":
      dotsType = "square";
      break;
    case "dots":
      dotsType = "extra-rounded";  // This will render extra dots style as per your library
      break;
    case "classy":
      dotsType = "classy"; // The classy style
      break;
    default:
      dotsType = "square";
  }


  qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    data: text,
    image: logoConfig?.image || "",
    dotsOptions: {
      color: colorDarkInput.value,
      type: dotsType,
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
  styleRadios.forEach((radio) => {
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
  const isExpanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";

  // Toggle visibility
  if (isExpanded) {
    moreOptions.style.display = "none";
  } else {
    moreOptions.style.display = "block";
  }

  toggleOptionsBtn.setAttribute("aria-expanded", String(!isExpanded));
  toggleOptionsBtn.innerHTML =
    (!isExpanded ? "Less options " : "More options ") +
    '<i class="fas fa-chevron-down arrow"></i>';
});

// Tooltip toggle handler
tooltipToggleBtn.addEventListener("click", () => {
  const isExpanded = tooltipToggleBtn.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    tooltipPanel.hidden = true;
  } else {
    tooltipPanel.hidden = false;
  }
  tooltipToggleBtn.setAttribute("aria-expanded", String(!isExpanded));
});

tooltipCloseBtn.addEventListener("click", () => {
  tooltipPanel.hidden = true;
  tooltipToggleBtn.setAttribute("aria-expanded", "false");
});

// Generate button
generateBtn.addEventListener("click", createQRCode);

// Download button
downloadBtn.addEventListener("click", () => {
  if (!qrCode) {
    alert("Please generate a QR code first.");
    return;
  }
  qrCode.download({ extension: formatSelect.value });
});

// Reset button
resetBtn.addEventListener("click", () => {
  resetSettings();
  createQRCode();
});

// Listen for changes to regenerate QR code
[colorDarkInput, colorLightInput, formatSelect].forEach((el) =>
  el.addEventListener("input", () => {
    if (qrCode) createQRCode();
  })
);

styleRadios.forEach((radio) =>
  radio.addEventListener("change", () => {
    if (qrCode) createQRCode();
  })
);

logoUpload.addEventListener("change", handleLogoUpload);

// Initial state
resetSettings();
createQRCode();
