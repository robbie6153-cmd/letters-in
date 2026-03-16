// ===== LETTERS IN DAILY GAME =====

// 9-letter master word list (add more later)
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

// Simple dictionary sample (expand later)
const dictionary = [
"tone","note","eat","tea","ate","cat","act","toe","one","red","ran",
"read","road","tone","rent","earn","near","stone","react","create",
"trace","crate","cater","cart","care","race","tear","rate","tare",
"earn","neat","ante","train","retain","retina","retained"
];

// DAILY WORD SELECTION
function getDailyWord() {

const today = new Date();
const seed = today.getFullYear() + today.getMonth() + today.getDate();

const index = seed % masterWords.length;

return masterWords[index];

}

const masterWord = getDailyWord().toUpperCase();
let letters = masterWord.split("");

// shuffle letters
letters.sort(() => Math.random() - 0.5);

// game state
let score = 0;
let timeLeft = 200;
let playedWords = [];

// DOM elements
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

// TIMER
const timer = setInterval(() => {

timeLeft--;

timerDiv.innerText = "Time: " + timeLeft;

if(timeLeft <= 0){

clearInterval(timer);
endGame();

}

},1000);

// SUBMIT WORD
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

// score = word length
score += word.length;

scoreDiv.innerText = "Score: " + score;

playedWords.push(word);

message.innerText = "Accepted!";

}

// LETTER CHECK
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

// END GAME
function endGame(){

localStorage.setItem("lettersinPlayed", todayKey);

document.getElementById("game").style.display = "none";
document.getElementById("endScreen").style.display = "block";

document.getElementById("finalScore").innerText =
"Time’s Up! You scored " + score + " points. Come back tomorrow for another game.";

}