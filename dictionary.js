// dictionary.js — loads a full English word list
let dictionary = [];

// load the full word list at runtime
fetch("https://cdn.jsdelivr.net/npm/an-array-of-english-words/index.json")
  .then(res => res.json())
  .then(words => {
    dictionary = words.map(w => w.toLowerCase());
    console.log("Dictionary loaded:", dictionary.length, "words");
  })
  .catch(err => {
    console.error("Failed to load dictionary:", err);
  });