// Ef þú vilt að smelli á litlu táknin opni síður:
const basePath = '../'; // Þetta fer upp um eina möppu

document.getElementById("teningur").addEventListener("click", function() {
  window.location.href = `${basePath}Leikjasidan/index.html`;
});
document.getElementById("rammi").addEventListener("click", function() {
  window.location.href = `${basePath}Myndasogugerd/myndatol.html`;
});
document.getElementById("skrifa").addEventListener("click", function() {
  window.location.href = `${basePath}Myndasogugerd/tekstatol.html`;
});
document.getElementById("palletta").addEventListener("click", function() {
  window.location.href = `${basePath}Myndasogugerd/teiknitol.html`;
});

// Fiskur 1
document.getElementById("fiskur1").addEventListener("click", function() {
  window.location.href = `${basePath}Karakterar/index.html`;
});

// Fiskur 2
document.getElementById("fiskur2").addEventListener("click", function() {
  window.location.href = `${basePath}Karakterar/index.html`;
});

// Hundur
document.getElementById("hundur").addEventListener("click", function() {
  window.location.href = `${basePath}Solusida/index.html`;
});

// Arctic
document.getElementById("arctic").addEventListener("click", function() {
  window.location.href = `${basePath}ARCTIC/index.html`;
});

// 2024
document.getElementById("arid").addEventListener("click", function() {
  window.location.href = `${basePath}Arid2024/index.html`;
});

// List of plant emojis
const plantEmojis = ["🌱", "🌿", "☘️", "🌵", "🌻", "🍄", "🌴", "🌳", "🌲", "🌾", "🌼",  "🪴", "🥀"  ];

// Function to get a random plant emoji
function getRandomPlantEmoji() {
  return plantEmojis[Math.floor(Math.random() * plantEmojis.length)];
}

// Function to create and display a plant emoji at the click position
function displayPlantEmoji(event) {
  const emoji = document.createElement("div");
  emoji.textContent = getRandomPlantEmoji();
  emoji.style.position = "absolute";
  emoji.style.left = `${event.clientX}px`;
  emoji.style.top = `${event.clientY}px`;
  emoji.style.fontSize = "48px"; // Increase the font size
  emoji.classList.add("plant-emoji");
  document.body.appendChild(emoji);
}

// Function to check if the dog overlaps with any plant emojis
function checkDogOverlap() {
  const dog = document.querySelector(".hundur");
  const emojis = document.querySelectorAll(".plant-emoji");
  const dogRect = dog.getBoundingClientRect();

  emojis.forEach(emoji => {
    const emojiRect = emoji.getBoundingClientRect();
    if (
      dogRect.left < emojiRect.right &&
      dogRect.right > emojiRect.left &&
      dogRect.top < emojiRect.bottom &&
      dogRect.bottom > emojiRect.top
    ) {
      emoji.remove();
    }
  });
}

// Add event listener to the container to display plant emojis on click
document.querySelector(".container").addEventListener("click", function(event) {
  if (!event.target.closest(".button-container, .mini-icon, .hnappur-overlay")) {
    displayPlantEmoji(event);
  }
});

// Check for dog overlap with plant emojis at regular intervals
setInterval(checkDogOverlap, 100);

