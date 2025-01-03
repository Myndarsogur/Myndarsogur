// Veljum gáma fyrir stjörnur og miðtexta
const starsContainer = document.querySelector('.stars');
const centerText = document.querySelector('.center-text');
const symbols = document.querySelectorAll('.symbol');

// Búa til stjörnur sem ferðast yfir skjáinn
function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`; // Tilviljanakennd lárétt staðsetning
    star.style.top = `${Math.random() * 100}vh`; // Tilviljanakennd lóðrétt staðsetning
    star.style.animationDuration = `${Math.random() * 2 + 1}s`; // Hreyfingarhraði
    star.style.opacity = Math.random(); // Slembin ógagnsæi
    starsContainer.appendChild(star);

    // Fjarlægja stjörnur eftir að hreyfing lýkur
    setTimeout(() => star.remove(), 3000);
}

// Kalla reglulega á createStar
setInterval(createStar, 100);

// Dreifa stjörnumerkjum jafnt í hring
symbols.forEach((symbol, index) => {
    const angle = (index / symbols.length) * 360; // Reikna horn fyrir hvert tákn
    symbol.style.setProperty('--angle', `${angle}deg`);

    // Þegar smellt er á tákn, sýnum texta í miðjunni
    symbol.addEventListener('click', () => {
        const text = symbol.getAttribute('data-text');
        centerText.textContent = text;

        // Bæta við smá sjónrænum áhrifum
        centerText.style.opacity = '1';
        centerText.style.transform = 'scale(1)';
    });
});

// Sjálfgefnar stílar fyrir miðtexta
centerText.style.opacity = '0';
centerText.style.transform = 'scale(0.8)';