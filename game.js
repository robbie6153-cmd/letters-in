// Example game letters array (replace with your actual game logic)
let currentLetters = "EXAMPLE"; // letters to display
let score = 0;

// Function to render letters as tiles
function renderLetters() {
  const lettersDiv = document.getElementById('letters');
  lettersDiv.innerHTML = ''; // clear previous letters

  currentLetters.split('').forEach(letter => {
    const span = document.createElement('span');
    span.textContent = letter;
    lettersDiv.appendChild(span);
  });
}

// Initial render
renderLetters();

// Timer example (60s countdown)
let timeLeft = 60;
const timerEl = document.getElementById('time');
const timerInterval = setInterval(() => {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0) clearInterval(timerInterval);
}, 1000);

// Score example
const scoreEl = document.getElementById('points');
document.getElementById('submitBtn').addEventListener('click', () => {
  const input = document.getElementById('wordInput');
  if (input.value.toUpperCase() === currentLetters) {
    score += 10;
    document.getElementById('message').textContent = 'Correct!';
  } else {
    document.getElementById('message').textContent = 'Wrong!';
  }
  scoreEl.textContent = score;
  input.value = '';
});