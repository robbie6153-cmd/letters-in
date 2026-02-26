const startBtn = document.getElementById("start-btn");
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");

startBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
});

// Simple word game logic
const letters = ["A", "P", "L", "E"];
const input = document.getElementById("word-input");
const submitBtn = document.getElementById("submit-word");
const result = document.getElementById("result");

submitBtn.addEventListener("click", () => {
  const word = input.value.toUpperCase();
  if (isValidWord(word)) {
    result.textContent = "✅ Nice word!";
  } else {
    result.textContent = "❌ Invalid word";
  }
  input.value = "";
});

function isValidWord(word) {
  const lettersCopy = [...letters];
  for (let char of word) {
    const index = lettersCopy.indexOf(char);
    if (index === -1) return false;
    lettersCopy.splice(index, 1);
  }
  return word.length >= 3;
}