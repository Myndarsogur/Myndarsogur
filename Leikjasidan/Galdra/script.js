const symbols = document.querySelectorAll('.symbol');
const centerText = document.querySelector('.center-text');

symbols.forEach(symbol => {
  symbol.addEventListener('click', () => {
    const message = symbol.dataset.text;
    centerText.textContent = message;
  });
});
