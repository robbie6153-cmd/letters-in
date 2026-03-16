// ===== LETTERS IN DAILY GAME =====

// Master word list (expand later or replace with 9-letter words you prefer)
const masterWords = [
  "EDUCATION",
  "PAINTWORK",
  "NOTEWORTH",
  "UNDERMIND",
  "TRAINABLE",
  "RELATION",
  "CREATION",
  "REACTION",
  "SEPARATED",
  "GENERATED"
];

// Large dictionary (example, replace with full list for real game)
const dictionary = [/* paste all 100k words here */];

// ===== DAILY PUZZLE LOGIC =====
function getDailyWord() {
  const today = new Date();
  const seed = today.getFullYear() + today.getMonth() + today.getDate();
  const index = seed % masterWords.length;
  return masterWords[index];
}

const masterWord = getDailyWord().toUpperCase();
let letters = masterWord.split("");

// Shuffle letters
letters.sort(() => Math.random() - 0.5);

// ===== GAME STATE =====
let score = 0;
let timeLeft = 200;
let playedWords = [];

// ===== DOM ELEMENTS =====
const lettersDiv = document.getElementById("letters");
const timerDiv = document.getElementById("timer");
const scoreDiv = document.getElementById("score");
const input = document.getElementById("wordInput");
const message = document.getElementById("message");

// DAILY PLAY LOCK
const todayKey = new Date().toDateString();
if(localStorage.getItem("lettersinPlayed") === todayKey){
  document.getElementById("game").style.display = "none";
  document.getElementById("endScreen").style.display = "block";
  document.getElementById("finalScore").innerText =
    "You've already played today. Come back tomorrow!";
}

// SHOW LETTERS
lettersDiv.innerText = letters.join(" ");

// ===== TIMER =====
const timer = setInterval(() => {
  timeLeft--;
  timerDiv.innerText = "Time: " + timeLeft;
  if(timeLeft <= 0){
    clearInterval(timer);
    endGame();
  }
}, 1000);

// ===== SUBMIT WORD =====
function submitWord(){
  const word = input.value.toLowerCase().trim();
  input.value = "";

  if(word.length < 3){
    message.innerText = "Word too short";
    return;
  }

  if(playedWords.includes(word)){
    message.innerText = "Already used";
    return;
  }

  if(!dictionary.includes(word)){
    message.innerText = "Not in dictionary";
    return;
  }

  if(!canMakeWord(word)){
    message.innerText = "Can't make from letters";
    return;
  }

  // Add points based on word length
  score += calculateScore(word);
  scoreDiv.innerText = "Score: " + score;

  playedWords.push(word);
  message.innerText = "Accepted!";
}

// ===== SCORE CALCULATION =====
function calculateScore(word){
  switch(word.length){
    case 6: return 2;
    case 7: return 3;
    case 8: return 4;
    case 9: return 5;
    default: return 1; // all other words 1 point
  }
}

// ===== CHECK IF WORD CAN BE MADE FROM LETTERS =====
function canMakeWord(word){
  let tempLetters = masterWord.toLowerCase().split("");
  for(let char of word){
    let index = tempLetters.indexOf(char);
    if(index === -1){
      return false;
    }
    tempLetters.splice(index,1);
  }
  return true;
}

// ===== END GAME =====
function endGame(){
  localStorage.setItem("lettersinPlayed", todayKey);
  document.getElementById("game").style.display = "none";
  document.getElementById("endScreen").style.display = "block";
  document.getElementById("finalScore").innerText =
    "Time’s Up! You scored " + score + " points. Come back tomorrow for another game.";
}