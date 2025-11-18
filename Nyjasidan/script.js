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

// Emoji safn eftir svæði
const plantEmojis = ["🌱", "🌿", "☘️", "🌵", "🌻", "🍄", "🌴", "🌳", "🌲", "🌾", "🌼", "🪴", "🥀"];
const cloudEmojis = ["☁️", "🌤️", "⛅️", "🌥️", "☁︎", "🌦️"];
const starEmojis  = ["⭐️", "🌟", "✨", "💫", "🌠", "🌌"];
const foodEmojis  = ["🍉", "🍓", "🍇", "🍎", "🍒", "🍰", "🧁", "🥐", "🥪", "🍕", "🍪", "🥞", "🍤"];
const seaEmojis   = ["🐟", "🐠", "🐡", "🐙", "🦀", "🦑", "🦞", "🪼", "🐚", "🌊", "🐬"];

function getEmojiConfig(zone){
  if(zone.classList.contains("quad--sky")){
    const isNight = document.querySelector(".sky-layer--night").classList.contains("is-visible");
    return isNight
      ? { icons: starEmojis, className: "star-emoji" }
      : { icons: cloudEmojis, className: "cloud-emoji" };
  }
  if(zone.classList.contains("quad--green-top")){
    return { icons: plantEmojis, className: "plant-emoji" };
  }
  if(zone.classList.contains("quad--green-bottom")){
    return { icons: foodEmojis, className: "food-emoji" };
  }
  if(zone.classList.contains("quad--ocean")){
    return { icons: seaEmojis, className: "sea-emoji" };
  }
  return null;
}

function getRandomEmoji(list){
  return list[Math.floor(Math.random() * list.length)];
}

function spawnEmoji(event, config){
  const emoji = document.createElement("div");
  emoji.textContent = getRandomEmoji(config.icons);
  emoji.style.position = "absolute";
  emoji.style.left = `${event.clientX}px`;
  emoji.style.top = `${event.clientY}px`;
  emoji.style.fontSize = "48px"; // Increase the font size
  emoji.classList.add("floating-emoji", config.className);
  document.body.appendChild(emoji);
}

const nightLayer = document.querySelector(".sky-layer--night");

function updateSkyState(){
  const isNight = parseFloat(getComputedStyle(nightLayer).opacity) > 0.5;
  nightLayer.classList.toggle("is-visible", isNight);
}

updateSkyState();
setInterval(updateSkyState, 400);

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

// Add event listener to the container to display emojis á mismunandi svæðum
document.querySelector(".container").addEventListener("click", function(event) {
  if (event.target.closest(".mini-icon, .button-container, #arctic, #arid, #hundur, .fiskur, .floating-button")) return;
  const zone = event.target.closest(".quad");
  if(!zone) return;
  const config = getEmojiConfig(zone);
  if(!config) return;
  spawnEmoji(event, config);
});

// Check for dog overlap with plant emojis at regular intervals
setInterval(checkDogOverlap, 100);
