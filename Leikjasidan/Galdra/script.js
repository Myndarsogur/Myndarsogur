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
        // Bætum við hreyfingu í textann
        centerText.style.opacity = '0'; // Byrjum á að fela textann
        centerText.style.transform = 'scale(0.8)';
        setTimeout(() => {
            centerText.style.opacity = '1';
            centerText.style.transform = 'scale(1)';
        }, 100); // Sýnum textann aftur með smá töf
    });
});

// Stílar fyrir miðtexta í byrjun
centerText.style.opacity = '0';
centerText.style.transform = 'scale(0.8)';
