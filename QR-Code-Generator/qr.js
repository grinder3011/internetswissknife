const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  type: "canvas",
  data: "",
  image: "",
  dotsOptions: {
    type: "square",
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
  },
});

const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrContainer = document.getElementById("qrcode");
const formatSelect = document.getElementById("format");
const colorDark = document.getElementById("color-dark");
const colorLight = document.getElementById("color-light");
const logoUpload = document.getElementById("logo-upload");
const styleRadios = document.getElementsByName("style");
const resetBtn = document.getElementById("reset-btn");

function getSelectedStyle() {
  const selected = Array.from(styleRadios).find((r) => r.checked);
  return selected ? selected.value : "square";
}

function createQRCode() {
  const data = qrInput.value.trim();
  if (!data) return;

  const style = getSelectedStyle();

  const styleMap = {
    square: "square",
    "extra-rounded": "extra-rounded",
    classy: "classy",
  };

  qrCode.update({
    data: data,
    dotsOptions: {
      type: styleMap[style] || "square",
      color: colorDark.value,
    },
    backgroundOptions: {
      color: colorLight.value,
    },
    image: qrCode._options.image,
  });

  qrCode.append(qrContainer);
}

generateBtn.addEventListener("click", createQRCode);

downloadBtn.addEventListener("click", () => {
  const extension = formatSelect.value;
  qrCode.download({ extension });
});

logoUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    qrCode.update({
      image: reader.result,
    });
    createQRCode();
  };
  reader.readAsDataURL(file);
});

resetBtn.addEventListener("click", () => {
  qrInput.value = "";
  colorDark.value = "#000000";
  colorLight.value = "#ffffff";
  formatSelect.value = "png";
  logoUpload.value = "";
  document.querySelector('input[name="style"][value="square"]').checked = true;

  qrCode.update({
    data: "",
    dotsOptions: {
      type: "square",
      color: "#000000",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    image: "",
  });

  qrContainer.innerHTML = "";
});
