// ---------------- Hidden 9-letter word ----------------
const masterWord = "EDUCATION";

// Shuffle letters for display
function shuffle(word){
    return word.split('').sort(()=>Math.random()-0.5).join('');
}

const letters = shuffle(masterWord);
document.getElementById("letters").innerText = letters;

// ---------------- Scoring & used words ----------------
let score = 0;
let usedWords = [];

function scoreWord(word){
    return word.length; // points = word length
}

// ---------------- Dictionary ----------------
// Sample larger dictionary (replace with full one for production)
const dictionary = [
    "act","cat","dog","tone","note","done","dance","action","educate","education",
    "cation","auction","coat","cone","date","coin","dice","once","icon","audit",
    "audio","cationed","audition","auditioned","educations","aced","iced","dace"
];

// ---------------- Helper: can make word from letters ----------------
function canMakeWord(word){
    let temp = letters.split('');
    for(let l of word){
        let index = temp.indexOf(l.toUpperCase());
        if(index === -1) return false;
        temp.splice(index,1);
    }
    return true;
}

// ---------------- Submit word function ----------------
function submitWord(){
    let input = document.getElementById("wordInput").value.toLowerCase();
    document.getElementById("wordInput").value="";

    if(input.length < 3){
        message("Word too short");
        return;
    }

    if(usedWords.includes(input)){
        message("Already used");
        return;
    }

    if(!dictionary.includes(input)){
        message("Not in dictionary");
        return;
    }

    if(!canMakeWord(input)){
        message("Cannot be made from letters");
        return;
    }

    usedWords.push(input);

    let points = scoreWord(input);
    score += points;

    document.getElementById("score").innerText="Score: "+score;
    message("+"+points+" points!");
}

function message(text){
    document.getElementById("message").innerText=text;
}

// ---------------- Timer ----------------
let time = 200;
let timer = setInterval(function(){
    time--;
    document.getElementById("timer").innerText="Time: "+time;
    if(time <= 0){
        clearInterval(timer);
        endGame();
    }
},1000);

// ---------------- End game ----------------
function endGame(){
    document.getElementById("game").style.display="none";
    document.getElementById("endScreen").style.display="block";
    document.getElementById("finalScore").innerText =
        "Time’s Up! You scored "+score+" points.";
}

// ---------------- Daily reset ----------------
const today = new Date().toDateString();
const lastPlayed = localStorage.getItem("lastPlayed");

if(lastPlayed === today){
    document.getElementById("game").style.display="none";
    document.getElementById("endScreen").style.display="block";
    document.getElementById("finalScore").innerText =
        "You've already played today.";
} else {
    localStorage.setItem("lastPlayed", today);
}