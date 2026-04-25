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
const loggedInBox = document.getElementById("loggedInBox");
const gameLoggedInBox = document.getElementById("gameLoggedInBox");

function getDictionaryArray() {
  if (typeof dictionary !== "undefined" && Array.isArray(dictionary)) return dictionary;
  if (typeof words !== "undefined" && Array.isArray(words)) return words;
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

  if (!dict) {
    messageEl.textContent = "Dictionary not loaded.";
    return "CHOCOLATE";
  }

  const nineLetterWords = dict
    .filter(word => typeof word === "string")
    .map(word => word.trim().toUpperCase())
    .filter(word => /^[A-Z]{9}$/.test(word));

  if (nineLetterWords.length === 0) {
    messageEl.textContent = "No 9-letter words found.";
    return "NOTEBOOKS";
  }

  const seed = getDailySeed();
  const index = Math.floor(Math.sin(seed) * 10000) % nineLetterWords.length;
  return nineLetterWords[Math.abs(index)];
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

function submitScore() {
  const user = window.robTechCurrentUser || window.auth?.currentUser;

  if (!user) {
    localStorage.setItem("pendingLettersInScore", score);
    showAccountOptions();
    return;
  }

  if (typeof window.submitRobTechScore === "function") {
    window.submitRobTechScore(score);
    updateLettersInStats(score);
  } else {
    alert("Score system not ready. Please try again.");
  }
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

function updateLoginDisplay() {
  const username = window.robTechUsername;

  if (username) {
    if (loggedInBox) {
      loggedInBox.innerHTML = `Logged in as<br><strong>${username}</strong>`;
    }

    if (gameLoggedInBox) {
      gameLoggedInBox.innerHTML = `Logged in as <strong>${username}</strong>`;
    }
  } else {
    if (loggedInBox) {
      loggedInBox.innerHTML = "";
    }

    if (gameLoggedInBox) {
      gameLoggedInBox.innerHTML = "";
    }
  }
}

setInterval(updateLoginDisplay, 500);
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
function endGame() {
  clearInterval(timerInterval);

  inputEl.disabled = true;
  submitBtn.disabled = true;
  messageEl.textContent = "";

  finalScoreEl.innerHTML = `
    <p>Game's up. Your score was ${score}. Come back tomorrow for a new game.</p>

    <div class="end-buttons">
      <button onclick="submitScore()" id="finalSubmitScoreBtn" class="submit-score-btn">Submit Score</button>
      <button onclick="goToLeaderboard()" class="leaderboard-btn">View Leaderboard</button>
    </div>
  `;
}
async function updateLettersInStats(finalScore) {
  const user = window.auth?.currentUser;
  const db = window.db;

  if (!user || !db) {
    console.log("Stats not saved: user or database not ready.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const statsRef = window.doc(db, "users", user.uid, "stats", "lettersIn");
  const statsSnap = await window.getDoc(statsRef);

  let stats = {
    timesPlayed: 0,
    highestScore: 0,
    totalScore: 0,
    averageScore: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastPlayedDate: null
  };

  if (statsSnap.exists()) {
    stats = {
      ...stats,
      ...statsSnap.data()
    };
  }

  let currentStreak = stats.currentStreak || 0;

  if (stats.lastPlayedDate === today) {
    currentStreak = stats.currentStreak || 1;
  } else if (stats.lastPlayedDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const timesPlayed = (stats.timesPlayed || 0) + 1;
  const totalScore = (stats.totalScore || 0) + Number(finalScore || 0);
  const highestScore = Math.max(stats.highestScore || 0, Number(finalScore || 0));
  const averageScore = Math.round(totalScore / timesPlayed);
  const longestStreak = Math.max(stats.longestStreak || 0, currentStreak);

  await window.setDoc(statsRef, {
    timesPlayed,
    highestScore,
    totalScore,
    averageScore,
    longestStreak,
    currentStreak,
    lastPlayedDate: today
  }, { merge: true });

  console.log("Stats saved");
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
window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const shouldSubmitPendingScore = params.get("submitPendingScore");

  if (shouldSubmitPendingScore === "true") {
    const pendingScore = localStorage.getItem("pendingLettersInScore");

    if (pendingScore !== null) {
      const scoreNumber = Number(pendingScore);
setTimeout(() => {
  if (typeof window.submitRobTechScore === "function") {
    window.submitRobTechScore(scoreNumber);
    updateLettersInStats(scoreNumber);

    localStorage.removeItem("pendingLettersInScore"); // ✅ MOVE HERE

  } else {
    alert("Score system not ready. Please try again.");
  }
}, 1000);
    }
  }
});