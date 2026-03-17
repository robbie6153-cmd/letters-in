// Example dictionary.js assumed to define an array "dictionary" of words
// const dictionary = ["EXAMPLES", "ANOTHERWORD", ...];

// Helper: select a random 9-letter word daily
function getDailyWord() {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  const nineLetterWords = dictionary.filter(word => word.length === 9);
  if(nineLetterWords.length === 0) return "EXAMPLE"; // fallback
  const index = daySeed % nineLetterWords.length;
  return nineLetterWords[index].toUpperCase();
}

let currentWord = getDailyWord();
let score = 0;
let usedWords = new Set();

// Render letters as tiles
function renderLetters() {
  const lettersDiv = document.getElementById('letters');
  lettersDiv.innerHTML = '';
  currentWord.split('').forEach(letter => {
    const span = document.createElement('span');
    span.textContent = letter;
    lettersDiv.appendChild(span);
  });
}

renderLetters();

// Timer
let timeLeft = 200;
const timerEl = document.getElementById('time');
const interval = setInterval(() => {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(interval);
    endGame();
  }
}, 1000);

// Scoring rules
function calculatePoints(word) {
  const len = word.length;
  if(len < 3) return 0;
  if(len === 3 || len === 4 || len === 5) return 1;
  if(len === 6) return 2;
  if(len === 7) return 3;
  if(len === 8) return 4;
  if(len === 9) return 5;
  return 0;
}

// Submit word
document.getElementById('submitBtn').addEventListener('click', () => {
  const input = document.getElementById('wordInput');
  const word = input.value.toUpperCase();
  if(!word || usedWords.has(word)) {
    document.getElementById('message').textContent = "Already used or empty!";
    input.value = '';
    return;
  }

  usedWords.add(word);
  const points = calculatePoints(word);
  score += points;
  document.getElementById('points').textContent = score;
  document.getElementById('message').textContent = `+${points} point(s) for "${word}"`;
  input.value = '';
});

// End game
function endGame() {
  document.getElementById('message').textContent = '';
  document.getElementById('finalScore').textContent = `Game over! Your score: ${score}. Come back tomorrow for a new game.`;
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('wordInput').disabled = true;
}