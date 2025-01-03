// Velja element fyrir tákn og texta
const symbols = document.querySelectorAll('.symbol');
const centerText = document.querySelector('.center-text');
const starsContainer = document.querySelector('.stars');

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

// Búa til kyrrstjörnur í bakgrunni
function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    starsContainer.appendChild(star);

    setTimeout(() => star.remove(), 5000); // Fjarlægir stjörnu eftir 5 sek
}

// Kalla reglulega á createStar
setInterval(createStar, 200);

// Búa til stjörnur sem þjóta
function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = `${Math.random() * 100}vw`;
    shootingStar.style.top = `${Math.random() * 50}vh`;
    shootingStar.style.animationDuration = `${Math.random() * 2 + 1}s`;
    starsContainer.appendChild(shootingStar);

    setTimeout(() => shootingStar.remove(), 2000); // Fjarlægir skjóta stjörnu eftir 2 sek
}

// Kalla reglulega á createShootingStar
setInterval(createShootingStar, 1000);