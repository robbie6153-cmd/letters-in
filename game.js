let score = 0;
let timeLeft = 200;
let usedWords = new Set();
let currentWord = "";
let shuffledLetters = [];
let timerInterval;

const lettersEl = document.getElementById("letters");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("points");
const inputEl = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const messageEl = document.getElementById("message");
document.getElementById("finalScore").innerHTML = `
  <p>Time's up! You scored ${score} points. Come back tomorrow for a new game.</p>
  <div class="end-buttons">
    <button onclick="submitScore()">Submit Score</button>
    <button onclick="goHome()">Home</button>
  </div>
`;
function goHome() {
  document.getElementById("game").style.display = "none";
  document.getElementById("rules-screen").style.display = "none";
  document.getElementById("home-screen").style.display = "block";
}

function submitScore() {
  alert("Score submission coming soon!");
}
function getDictionaryArray() {
  if (typeof dictionary !== "undefined" && Array.isArray(dictionary)) {
    return dictionary;
  }
  if (typeof words !== "undefined" && Array.isArray(words)) {
    return words;
  }
  return null;
}

function getDailySeed() {
  const today = new Date();
  return Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  );
}

function shuffleArray(arr, seed) {
  const result = [...arr];
  let randomSeed = seed;

  function seededRandom() {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function pickDailyWord() {
  const dict = getDictionaryArray();

  if (!dict || dict.length === 0) {
    return "NOTEBOOKS";
  }

  const nineLetterWords = dict
    .filter(word => typeof word === "string")
    .map(word => word.trim().toUpperCase())
    .filter(word => /^[A-Z]{9}$/.test(word));

  if (nineLetterWords.length === 0) {
    return "NOTEBOOKS";
  }

  const seed = getDailySeed();
  return nineLetterWords[seed % nineLetterWords.length];
}

function renderLetters() {
  lettersEl.innerHTML = "";
  shuffledLetters.forEach(letter => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = letter;
    lettersEl.appendChild(tile);
  });
}

function canMakeWordFromLetters(word, letters) {
  const available = [...letters];
  for (const char of word) {
    const index = available.indexOf(char);
    if (index === -1) return false;
    available.splice(index, 1);
  }
  return true;
}

function calculatePoints(word) {
  const len = word.length;
  if (len < 3) return 0;
  if (len >= 3 && len <= 5) return 1;
  if (len === 6) return 2;
  if (len === 7) return 3;
  if (len === 8) return 4;
  if (len === 9) return 5;
  return 0;
}

function submitWord() {
  const dict = getDictionaryArray();
  const word = inputEl.value.trim().toUpperCase();

  if (timeLeft <= 0) return;

  if (word.length < 3) {
    messageEl.textContent = "Word must be at least 3 letters.";
    inputEl.value = "";
    return;
  }

  if (usedWords.has(word)) {
    messageEl.textContent = "You already used that word.";
    inputEl.value = "";
    return;
  }

  if (!canMakeWordFromLetters(word, shuffledLetters)) {
    messageEl.textContent = "That word can't be made from these letters.";
    inputEl.value = "";
    return;
  }

  if (!dict || dict.length === 0) {
    messageEl.textContent = "Dictionary still loading. Try again in a moment.";
    return;
  }

  if (!dict.map(w => String(w).trim().toUpperCase()).includes(word)) {
    messageEl.textContent = "That word is not in the dictionary.";
    inputEl.value = "";
    return;
  }

  const points = calculatePoints(word);
  usedWords.add(word);
  score += points;
  scoreEl.textContent = score;
  messageEl.textContent = `Accepted: ${word} (+${points})`;
  inputEl.value = "";
}

function endGame() {
  clearInterval(timerInterval);
  inputEl.disabled = true;
  submitBtn.disabled = true;
  finalScoreEl.textContent = `Game's up. Your score was ${score}. Come back tomorrow for a new game.`;
}

function showRules() {
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("rules-screen").style.display = "block";
}

function startGame() {
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("rules-screen").style.display = "none";
  document.getElementById("game").style.display = "block";
}

submitBtn.addEventListener("click", submitWord);

inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    submitWord();
  }
});

setTimeout(() => {
  currentWord = pickDailyWord();
  shuffledLetters = shuffleArray(currentWord.split(""), getDailySeed());
  renderLetters();

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      timeEl.textContent = 0;
      endGame();
    }
  }, 1000);
}, 2000);