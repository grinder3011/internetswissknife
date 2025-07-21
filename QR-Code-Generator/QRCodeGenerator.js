const qrCode = new QRCodeStyling({
  width: 256,
  height: 256,
  type: "png",
  data: "",
  image: "",
  dotsOptions: {
    type: "square",
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10
  }
});

const input = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const formatSelect = document.getElementById("format");
const logoUpload = document.getElementById("logo-upload");
const colorDark = document.getElementById("color-dark");
const colorLight = document.getElementById("color-light");
const styleRadios = document.getElementsByName("style");
const toggleOptions = document.getElementById("toggle-options");
const moreOptions = document.getElementById("more-options");
const resetBtn = document.getElementById("reset-btn");

const qrContainer = document.getElementById("qr-code");
qrCode.append(qrContainer);

function updateQRCode() {
  qrCode.update({
    data: input.value,
    dotsOptions: {
      type: getSelectedStyle(),
      color: colorDark.value
    },
    backgroundOptions: {
      color: colorLight.value
    }
  });
}

function getSelectedStyle() {
  for (const radio of styleRadios) {
    if (radio.checked) return radio.value;
  }
  return "square";
}

generateBtn.addEventListener("click", () => {
  updateQRCode();
});

downloadBtn.addEventListener("click", () => {
  const extension = formatSelect.value;
  qrCode.download({ extension });
});

logoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    qrCode.update({ image: reader.result });
  };
  reader.readAsDataURL(file);
});

toggleOptions.addEventListener("click", () => {
  moreOptions.hidden = !moreOptions.hidden;
});

resetBtn.addEventListener("click", () => {
  input.value = "";
  colorDark.value = "#000000";
  colorLight.value = "#ffffff";
  formatSelect.value = "png";
  logoUpload.value = "";
  styleRadios[0].checked = true;
  qrCode.update({
    data: "",
    image: "",
    dotsOptions: { type: "square", color: "#000000" },
    backgroundOptions: { color: "#ffffff" }
  });
});
