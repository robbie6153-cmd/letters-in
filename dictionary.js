window.dictionary = [];

fetch("https://cdn.jsdelivr.net/npm/an-array-of-english-words/index.json")
  .then(response => response.json())
  .then(words => {
    window.dictionary = words.map(word => word.trim().toUpperCase());
    console.log("Dictionary loaded:", window.dictionary.length, "words");
  })
  .catch(error => {
    console.error("Error loading dictionary:", error);
  });