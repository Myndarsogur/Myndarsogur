// Velja element fyrir tákn og texta
const symbols = document.querySelectorAll('.symbol');
const centerText = document.querySelector('.center-text');

// Dreifa táknum jafnt í hring
symbols.forEach((symbol, index) => {
    const angle = (index / symbols.length) * 360; // Jafnt bil á milli tákna
    symbol.style.setProperty('--angle', `${angle}deg`);

    // Þegar smellt er á tákn
    symbol.addEventListener('click', () => {
        const text = symbol.getAttribute('data-text'); // Texti fyrir merki
        centerText.textContent = text; // Setur textann í miðjuna
    });
});

// Búa til stjörnur í bakgrunni
const starsContainer = document.querySelector('.stars');

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.width = `${Math.random() * 3 + 2}px`;
    star.style.height = star.style.width;
    star.style.animationDuration = `${Math.random() * 5 + 2}s`;
    star.style.opacity = Math.random();
    star.style.position = 'absolute';
    star.style.borderRadius = '50%';
    star.style.background = 'white';
    star.style.animation = 'twinkle 5s linear infinite';

    starsContainer.appendChild(star);

    setTimeout(() => star.remove(), 5000);
}

setInterval(createStar, 200);