const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const grid = document.getElementById('grid');
const saveButton = document.getElementById('save');
const columnsSlider = document.getElementById('columns-slider');
const columnsValue = document.getElementById('columns-value');
const gridClearButton = document.getElementById('grid-clear');

let images = [];

// Drag-and-drop event listeners
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.backgroundColor = '#eef';
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.backgroundColor = '#eaf5ff';
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.backgroundColor = '#eaf5ff';
  handleFiles(e.dataTransfer.files);
});

// File input event listener
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  Array.from(files).forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        images.push(event.target.result);
        renderGrid();
      };
      reader.readAsDataURL(file);
    }
  });
}

// Render grid with dynamic columns
function renderGrid() {
  const columns = parseInt(columnsSlider.value, 10) || 3;
  columnsValue.textContent = columns; // Update slider value display
  grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  grid.innerHTML = '';
  images.forEach((src, index) => {
    const container = document.createElement('div');

    const img = document.createElement('img');
    img.src = src;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';

    deleteButton.addEventListener('click', () => {
      images.splice(index, 1);
      renderGrid();
    });

    container.appendChild(img);
    container.appendChild(deleteButton);
    grid.appendChild(container);
  });
}

// Update grid on slider change
columnsSlider.addEventListener('input', () => {
  renderGrid();
});

// Clear all images
gridClearButton.addEventListener('click', () => {
  images = [];
  renderGrid();
});

// Save grid as image
saveButton.addEventListener('click', () => {
  html2canvas(grid).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'myndir.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});
