// Ef þú vilt að smelli á litlu táknin opni síður:
document.getElementById("teningur").addEventListener("click", function() {
  window.open("Leikjasidan/index.html", "_blank");
});
document.getElementById("rammi").addEventListener("click", function() {
  window.open("Myndasogugerd/myndatol.html", "_blank");
});
document.getElementById("skrifa").addEventListener("click", function() {
  window.open("Myndasogugerd/tekstatol.html", "_blank");
});
document.getElementById("palletta").addEventListener("click", function() {
  window.open("Myndasogugerd/teiknitol.html", "_blank");
});

// Fiskur 1
document.getElementById("fiskur1").addEventListener("click", function() {
  window.open("Karakterar/index.html", "_blank");
});

// Fiskur 2
document.getElementById("fiskur2").addEventListener("click", function() {
  window.open("Karakterar/index.html", "_blank");
});

// Hundur
document.getElementById("hundur").addEventListener("click", function() {
  window.open("Solusida/index.html", "_blank");
});

// Arctic
document.getElementById("arctic").addEventListener("click", function() {
  window.open("ARCTIC/index.html", "_blank");
});

// 2024
document.getElementById("twenty24").addEventListener("click", function() {
  window.open("Arid2024/index.html", "_blank");
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

