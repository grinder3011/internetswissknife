document.addEventListener("DOMContentLoaded", () => {
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
      qrCodeContainer.innerHTML =
        "<p style='color:#999'>Your QR code will be generated here</p>";
      qrCode = null;
      return;
    }

    qrCodeContainer.innerHTML = "";
    qrCode = null;

    const logoConfig = logoImage
      ? {
          image: logoImage,
          width: 50,
          height: 50,
        }
      : undefined;

    let dotsType;
    switch (getSelectedStyle()) {
      case "square":
        dotsType = "square";
        break;
      case "dots":
        dotsType = "extra-rounded";
        break;
      case "classy":
        dotsType = "classy-rounded";
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

  if (toggleOptionsBtn && moreOptions) {
    toggleOptionsBtn.addEventListener("click", () => {
      const isExpanded = toggleOptionsBtn.getAttribute("aria-expanded") === "true";
      moreOptions.hidden = isExpanded;
      toggleOptionsBtn.setAttribute("aria-expanded", String(!isExpanded));
      toggleOptionsBtn.innerHTML =
        (!isExpanded ? "Less options " : "More options ") +
        '<i class="fas fa-chevron-down arrow"></i>';
    });
  }

  generateBtn?.addEventListener("click", createQRCode);

  downloadBtn?.addEventListener("click", () => {
    if (!qrCode) {
      alert("Please generate a QR code first.");
      return;
    }
    qrCode.download({ extension: formatSelect.value });
  });

  resetBtn?.addEventListener("click", () => {
    resetSettings();
    createQRCode();
  });

  [colorDarkInput, colorLightInput, formatSelect].forEach((el) =>
    el?.addEventListener("input", () => {
      if (qrCode) createQRCode();
    })
  );

  styleRadios.forEach((radio) =>
    radio.addEventListener("change", () => {
      if (qrCode) createQRCode();
    })
  );

  logoUpload?.addEventListener("change", handleLogoUpload);

  // Initial state
  resetSettings();
  createQRCode();
});
