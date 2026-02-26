// Wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('start');
  const gameContainer = document.getElementById('game-container');

  startButton.addEventListener('click', function() {
    // Replace this with your real game logic later
    gameContainer.innerHTML = "<p>Game started! Your word game goes here.</p>";
    alert('Button works!');
  });
});