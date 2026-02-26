// Confirm script is loaded
console.log('Game script loaded');

// Hook up Start Game button
document.getElementById('start').addEventListener('click', function() {
  alert('Button works!'); // temporary test
  document.getElementById('game-container').innerHTML = "<p>Game started!</p>";
});