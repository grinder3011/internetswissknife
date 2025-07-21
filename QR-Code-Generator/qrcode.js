const inputText = document.getElementById('input-text');
const previewValue = document.getElementById('preview-value');
const colorDark = document.getElementById('color-dark');
const colorLight = document.getElementById('color-light');
const toggleMore = document.getElementById('toggle-more-options');
const moreOptions = document.getElementById('more-options');
const formatSelect = document.getElementById('format-select');
const logoUpload = document.getElementById('logo-upload');
const logoPreview = document.getElementById('logo-preview');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrcodeContainer = document.getElementById('qrcode');
const styleRadios = document.querySelectorAll('input[name="style"]');

let qr = null;
let logoImg = null;
let canvasElement = null;
let svgElement = null;

// Update preview live
inputText.addEventListener('input', () => {
  previewValue.textContent = inputText.value || '(empty)';
});

// Toggle more options
toggleMore.addEventListener('click', () => {
  const isOpen = moreOptions.classList.toggle('open');
  toggleMore.textContent = isOpen ? '➖ Less options' : '➕ More options';
});

// Logo preview on upload
logoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    logoPreview.style.display = 'none';
    logoImg = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = function(event) {
    logoPreview.src = event.target.result;
    logoPreview.style.display = 'inline-block';
    logoImg = new Image();
    logoImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Clear old QR
function clearQR() {
  qrcodeContainer.innerHTML = '';
  qr = null;
  canvasElement = null;
  svgElement = null;
}

// Generate QR code
function generateQR() {
  const text = inputText.value.trim();
  if (!text) {
    alert('Please enter text or URL to generate QR code.');
    return;
  }
  clearQR();

  const fg = colorDark.value;
  const bg = colorLight.value;
  const style = document.querySelector('input[name="style"]:checked').value;
  const format = formatSelect.value;

  if (format === 'svg') {
    qr = new QRCode(qrcodeContainer, {
      text,
      width: 256,
      height: 256,
      colorDark: fg,
      colorLight: bg,
      correctLevel: QRCode.CorrectLevel.H,
      useSVG: true,
    });
    svgElement = qrcodeContainer.querySelector('svg');

    if (style === 'dots') {
      applyDotStyleSVG(svgElement, fg);
    }
    if (logoImg) addLogoSVG(svgElement, logoImg);

  } else {
    qr = new QRCode(qrcodeContainer, {
      text,
      width: 256,
      height: 256,
      colorDark: fg,
      colorLight: bg,
      correctLevel: QRCode.CorrectLevel.H,
      useSVG: false,
    });
    canvasElement = qrcodeContainer.querySelector('canvas');

    if (logoImg) addLogoCanvas(canvasElement, logoImg);
  }
}

// Add logo overlay on SVG
function addLogoSVG(svg, logo) {
  if (!svg) return;
  logo.onload = () => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svgWidth = svg.getAttribute('width') || 256;
    const svgHeight = svg.getAttribute('height') || 256;

    const oldLogo = svg.querySelector('#logo-overlay');
    if (oldLogo) oldLogo.remove();

    const imgElem = document.createElementNS(svgNS, 'image');
    imgElem.setAttributeNS(null, 'id', 'logo-overlay');

    const size = svgWidth * 0.2;
    const x = (svgWidth - size) / 2;
    const y = (svgHeight - size) / 2;

    imgElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logo.src);
    imgElem.setAttributeNS(null, 'x', x);
    imgElem.setAttributeNS(null, 'y', y);
    imgElem.setAttributeNS(null, 'width', size);
    imgElem.setAttributeNS(null, 'height', size);
    imgElem.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet');

    svg.appendChild(imgElem);
  };
  if (logo.complete) logo.onload();
}

// Add logo overlay on canvas
function addLogoCanvas(canvas, logo) {
  if (!canvas || !logo) return;
  logo.onload = () => {
    const ctx = canvas.getContext('2d');
    const size = canvas.width * 0.2;
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    ctx.drawImage(logo, x, y, size, size);
  };
  if (logo.complete) logo.onload();
}

// Apply dots style to SVG QR code
function applyDotStyleSVG(svg, color) {
  if (!svg) return;
  const rects = svg.querySelectorAll('rect');
  rects.forEach(rect => {
    const cx = parseFloat(rect.getAttribute('x')) + parseFloat(rect.getAttribute('width'))/2;
    const cy = parseFloat(rect.getAttribute('y')) + parseFloat(rect.getAttribute('height'))/2;
    const r = parseFloat(rect.getAttribute('width')) / 2;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);

    rect.parentNode.replaceChild(circle, rect);
  });
}

// Download QR code
async function downloadQR() {
  if (!qr) {
    alert('Please generate a QR code first.');
    return;
  }
  const format = formatSelect.value;

  if (format === 'png') {
    const canvas = qrcodeContainer.querySelector('canvas');
    if (!canvas) {
      alert('PNG QR code not found.');
      return;
    }
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      triggerDownload(url, 'qrcode.png');
      URL.revokeObjectURL(url);
    });
  } else if (format === 'svg') {
    const svg = qrcodeContainer.querySelector('svg');
    if (!svg) {
      alert('SVG QR code not found.');
      return;
    }
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'qrcode.svg');
    URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    const canvas = qrcodeContainer.querySelector('canvas');
    if (!canvas) {
      alert('Please generate PNG QR code first (set format to PNG).');
      return;
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const imgData = canvas.toDataURL('image/png');
    const size = 100; // mm approx

    pdf.addImage(imgData, 'PNG', (pdf.internal.pageSize.getWidth() - size)/2, 20, size, size);
    pdf.save('qrcode.pdf');
  }
}

// Utility to trigger download
function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

generateBtn.addEventListener('click', generateQR);
downloadBtn.addEventListener('click', downloadQR);
