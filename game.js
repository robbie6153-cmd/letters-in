import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
let score = 0;
let timeLeft = 200;
let usedWords = new Set();
let currentWord = "";
let shuffledLetters = [];
let timerInterval;
let gameStarted = false;

const lettersEl = document.getElementById("letters");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const inputEl = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const messageEl = document.getElementById("message");
const finalScoreEl = document.getElementById("finalScore");

function getDictionaryArray() {
  if (window.dictionary && Array.isArray(window.dictionary) && window.dictionary.length > 0) {
    return window.dictionary;
  }

  return null;
}

function getDailySeed() {
  const today = new Date();
  return Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  );
}
function getTodayId() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
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

  if (!dict) {
    messageEl.textContent = "Dictionary still loading. Using today's backup word.";
    return "CHOCOLATE";
  }

  const nineLetterWords = dict
    .filter(word => typeof word === "string")
    .map(word => word.trim().toUpperCase())
    .filter(word => /^[A-Z]{9}$/.test(word));

  if (nineLetterWords.length === 0) {
    messageEl.textContent = "No 9-letter words found. Using backup word.";
    return "NOTEBOOKS";
  }

  const seed = getDailySeed();
  const index = Math.abs(Math.floor(Math.sin(seed) * 10000)) % nineLetterWords.length;

  return nineLetterWords[index];
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

  if (dict && !dict.map(w => String(w).trim().toUpperCase()).includes(word)) {
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

async function submitScore() {
  const loggedInUser = auth.currentUser;

  if (!loggedInUser) {
    showAccountOptions();
    return;
  }

  const todayId = getTodayId();

  try {
    await setDoc(
      doc(
        db,
        "leaderboards",
        "letters-in",
        "days",
        todayId,
        "scores",
        loggedInUser.uid
      ),
      {
        uid: loggedInUser.uid,
        email: loggedInUser.email || "",
        username: window.robTechUsername || "Player",
        score: score,
        day: todayId,
        game: "letters-in",
        submittedAt: serverTimestamp()
      },
      { merge: true }
    );

alert("Score submitted to today's leaderboard!");
window.location.href = "leaderboard.html";
  } catch (error) {
    console.error("Score submit error:", error);
    messageEl.textContent = "Could not submit score. Please try again.";
  }
}

function endGame() {
  clearInterval(timerInterval);

  inputEl.disabled = true;
  submitBtn.disabled = true;
  messageEl.textContent = "";

finalScoreEl.innerHTML = `
  <p>Game's up. Your score was ${score}. Come back tomorrow for a new game.</p>

  <div class="end-buttons">
    <button id="finalSubmitScoreBtn" class="submit-score-btn">Submit Score</button>
    <button onclick="goToLeaderboard()" class="leaderboard-btn">View Leaderboard</button>
  </div>
`;

  document
    .getElementById("finalSubmitScoreBtn")
    .addEventListener("click", submitScore);
}

function goToLeaderboard() {
  window.location.href = "leaderboard.html";
}
function showAccountOptions() {
  if (document.getElementById("accountRequiredBox")) return;

  finalScoreEl.innerHTML += `
    <div id="accountRequiredBox" style="margin-top:15px;">
      <p>You need to create an account or log in to submit your score.</p>

      <button onclick="showCreateAccount()">Create account</button>
      <button onclick="showLogin()">Already have account</button>
      <button onclick="goHome()">Home</button>
    </div>
  `;
}

function showCreateAccount() {
  window.location.href = "account.html";
}

function showLogin() {
  window.location.href = "account.html";
}


function goHome() {
  window.location.href = "index.html";
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  currentWord = pickDailyWord();
  shuffledLetters = shuffleArray(currentWord.split(""), getDailySeed());
  renderLetters();

  timeEl.textContent = timeLeft;
  scoreEl.textContent = score;

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      timeEl.textContent = 0;
      endGame();
    }
  }, 1000);
}

submitBtn.addEventListener("click", submitWord);

inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    submitWord();
  }
});

window.submitScore = submitScore;
window.showCreateAccount = showCreateAccount;
window.showLogin = showLogin;
window.goHome = goHome;
window.startGame = startGame;
window.goToLeaderboard = goToLeaderboard;
