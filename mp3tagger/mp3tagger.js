const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

fileInput.addEventListener('change', async () => {
  fileList.innerHTML = ''; // clear previous

  const files = Array.from(fileInput.files);

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();

    // Parse metadata
    const metadata = await musicMetadata.parseBlob(new Blob([arrayBuffer]));

    // Create UI elements
    const container = document.createElement('div');
    container.style.border = '1px solid #ccc';
    container.style.padding = '0.5rem';
    container.style.marginTop = '1rem';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = metadata.common.title || '';
    titleInput.placeholder = 'Title';

    const artistInput = document.createElement('input');
    artistInput.type = 'text';
    artistInput.value = metadata.common.artist || '';
    artistInput.placeholder = 'Artist';

    const albumInput = document.createElement('input');
    albumInput.type = 'text';
    albumInput.value = metadata.common.album || '';
    albumInput.placeholder = 'Album';

    container.appendChild(document.createTextNode(`File: ${file.name}`));
    container.appendChild(document.createElement('br'));
    container.appendChild(titleInput);
    container.appendChild(artistInput);
    container.appendChild(albumInput);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save & Download Edited MP3';

    saveBtn.onclick = () => {
      const writer = new ID3Writer(arrayBuffer);

      writer.setFrame('TIT2', titleInput.value)
            .setFrame('TPE1', [artistInput.value])
            .setFrame('TALB', albumInput.value)
            .addTag();

      const taggedBlob = writer.getBlob();

      const url = URL.createObjectURL(taggedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    container.appendChild(document.createElement('br'));
    container.appendChild(saveBtn);

    fileList.appendChild(container);
  }
});
