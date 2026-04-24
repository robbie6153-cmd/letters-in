let score = 0;
let timeLeft = 200;
let usedWords = new Set();
let currentWord = "";
let shuffledLetters = [];
let timerInterval;

const lettersEl = document.getElementById("letters");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const inputEl = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const messageEl = document.getElementById("message");
const finalScoreEl = document.getElementById("finalScore");

function hideIfExists(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function showIfExists(id, displayType) {
  const el = document.getElementById(id);
  if (el) el.style.display = displayType;
}

function goHome() {
  clearInterval(timerInterval);
  hideIfExists("game");
  hideIfExists("rules-screen");
  showIfExists("home-screen", "flex");
  showIfExists("home-content", "block");
}

function submitScore() {
  if (typeof window.submitRobTechScore === "function") {
    window.submitRobTechScore(score);
  } else {
    alert("You must create a RobTechUK Games account to submit your score to the leaderboard.");
  }
}

function getDictionaryArray() {
  if (typeof dictionary !== "undefined" && Array.isArray(dictionary)) return dictionary;
  if (typeof words !== "undefined" && Array.isArray(words)) return words;
  return null;
}

function getDailySeed() {
  const today = new Date();
  return Number(`${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleArray(arr, seed) {
  const result = [...arr];
  let currentSeed = seed;

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(currentSeed) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
    currentSeed++;
  }

  return result;
}

function pickDailyWord() {
  const dict = getDictionaryArray();

  if (!dict || dict.length === 0) return "NOTEBOOKS";

  const nineLetterWords = dict
    .filter(word => typeof word === "string")
    .map(word => word.trim().toUpperCase())
    .filter(word => /^[A-Z]{9}$/.test(word));

  if (nineLetterWords.length === 0) return "NOTEBOOKS";

  const seed = getDailySeed();
  const index = Math.floor(seededRandom(seed) * nineLetterWords.length);

  return nineLetterWords[index];
}

function renderLetters() {
  if (!lettersEl) {
    alert("Missing letters div in HTML");
    return;
  }

  lettersEl.style.display = "flex";
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

  finalScoreEl.innerHTML = `
    <p>Time's up! You scored ${score} points. Come back tomorrow for a new game.</p>
    <div class="end-buttons">
      <button onclick="submitScore()">Submit Score</button>
      <button onclick="goHome()">Home</button>
    </div>
  `;
}

function showRules() {
  hideIfExists("home-screen");
  showIfExists("rules-screen", "flex");
}

function startGame() {
  score = 0;
  timeLeft = 200;
  usedWords = new Set();

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  hideIfExists("home-screen");
  hideIfExists("home-content");
  hideIfExists("rules-screen");
  showIfExists("game", "flex");

  finalScoreEl.innerHTML = "";
  messageEl.textContent = "";
  inputEl.value = "";
  inputEl.disabled = false;
  submitBtn.disabled = false;

  loadGameLettersAndTimer();
}

submitBtn.addEventListener("click", submitWord);

inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    submitWord();
  }
});

function loadGameLettersAndTimer() {
  currentWord = pickDailyWord();
  shuffledLetters = shuffleArray(currentWord.split(""), getDailySeed());
  renderLetters();

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      timeEl.textContent = 0;
      endGame();
    }
  }, 1000);
}