document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.querySelector(".game-container");
  const bird = document.querySelector(".bird");
  const pipesContainer = document.querySelector(".pipes-container");
  const scoreDisplay = document.querySelector(".score");
  const finalScoreDisplay = document.querySelector(".final-score");
  const startScreen = document.querySelector(".start-screen");
  const gameOverScreen = document.querySelector(".game-over-screen");
  const startButton = document.querySelector(".start-button");
  const restartButton = document.querySelector(".restart-button");

  const gravity = 0.3;
  const jumpStrength = -7;
  const pipeGap = 190;
  const pipeInterval = 2300;

  let pipeSpeed = 4; // made mutable
  let speedIncreaseInterval;

  let birdPosition = 50;
  let birdVelocity = 0;
  let birdHeight = bird.offsetHeight;
  let gameWidth = gameContainer.offsetWidth;
  let gameHeight = gameContainer.offsetHeight;
  let isGameActive = false;
  let gameStarted = false;
  let score = 0;
  let pipes = [];
  let gameLoop;
  let pipeGenerationInterval;

  function init() {
    updateBirdPosition();
    document.addEventListener("keydown", handleKeyDown);
    document.body.addEventListener("touchstart", handleTap, { passive: false });
    gameContainer.addEventListener("touchstart", handleTap, { passive: false });
    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", restartGame);
    gameOverScreen.classList.add("hidden");
    handleResize();
    window.addEventListener("resize", handleResize);
  }

  function handleResize() {
    gameWidth = gameContainer.offsetWidth;
    gameHeight = gameContainer.offsetHeight;
    birdHeight = bird.offsetHeight;
    updateBirdPosition();
  }

  function startGame() {
    birdPosition = 50;
    birdVelocity = 0;
    score = 0;
    pipes = [];
    pipeSpeed = 3;
    scoreDisplay.textContent = "0";
    pipesContainer.innerHTML = "";
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    updateBirdPosition();
    isGameActive = true;
    gameStarted = false;

    // Increase speed every 5 seconds
    speedIncreaseInterval = setInterval(() => {
      if (pipeSpeed < 8) {
        pipeSpeed += 0.2;
      }
    }, 5000);
  }

  function restartGame() {
    startGame();
  }

  function handleKeyDown(e) {
    if (e.code === "Space") {
      if (!isGameActive) return;
      if (!gameStarted) {
        gameStarted = true;
        gameLoop = requestAnimationFrame(update);
        setTimeout(() => {
          pipeGenerationInterval = setInterval(generatePipe, pipeInterval);
        }, 1000);
      }
      jump();
    }
  }

  function handleTap(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isGameActive) return;

    if (!gameStarted) {
      gameStarted = true;
      gameLoop = requestAnimationFrame(update);
      setTimeout(() => {
        pipeGenerationInterval = setInterval(generatePipe, pipeInterval);
      }, 1000);
    }
    jump();
  }

  function jump() {
    birdVelocity = jumpStrength;
  }

  function updateBirdPosition() {
    bird.style.top = `${birdPosition}%`;
  }

  function generatePipe() {
    if (!isGameActive) return;

    const minPipeY = 80;
    const maxPipeY = gameHeight - pipeGap - 120;
    const gapPosition =
      Math.floor(Math.random() * (maxPipeY - minPipeY + 1)) + minPipeY;

    const topPipe = document.createElement("div");
    topPipe.className = "pipe pipe-top";
    topPipe.style.height = `${gapPosition}px`;
    topPipe.style.left = `${gameWidth}px`;

    const topPipeCap = document.createElement("div");
    topPipeCap.className = "pipe-cap";
    topPipe.appendChild(topPipeCap);

    const bottomPipe = document.createElement("div");
    bottomPipe.className = "pipe pipe-bottom";
    bottomPipe.style.height = `${gameHeight - gapPosition - pipeGap}px`;
    bottomPipe.style.left = `${gameWidth}px`;

    const bottomPipeCap = document.createElement("div");
    bottomPipeCap.className = "pipe-cap";
    bottomPipe.appendChild(bottomPipeCap);

    pipesContainer.appendChild(topPipe);
    pipesContainer.appendChild(bottomPipe);

    pipes.push({
      top: topPipe,
      bottom: bottomPipe,
      passed: false,
      x: gameWidth,
    });
  }

  function movePipes() {
    pipes.forEach((pipe, index) => {
      pipe.x -= pipeSpeed;
      pipe.top.style.left = `${pipe.x}px`;
      pipe.bottom.style.left = `${pipe.x}px`;

      if (!pipe.passed && pipe.x < 60 - 40) {
        pipe.passed = true;
        updateScore();
      }

      if (pipe.x < -60) {
        pipes.splice(index, 1);
        pipesContainer.removeChild(pipe.top);
        pipesContainer.removeChild(pipe.bottom);
      }
    });
  }

  function updateScore() {
    score++;
    scoreDisplay.textContent = score;
  }

  function checkCollisions() {
    const birdRect = {
      left: 60,
      right: 100,
      top: gameHeight * (birdPosition / 100),
      bottom: gameHeight * (birdPosition / 100) + birdHeight,
    };

    if (birdRect.bottom >= gameHeight * 0.8) {
      gameOver();
      return;
    }

    if (birdRect.top <= 0) {
      birdPosition = 0;
      birdVelocity = 0;
    }

    for (const pipe of pipes) {
      const topPipeRect = pipe.top.getBoundingClientRect();
      const bottomPipeRect = pipe.bottom.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();

      const adjustedTop = {
        left: topPipeRect.left - containerRect.left,
        right: topPipeRect.right - containerRect.left,
        top: topPipeRect.top - containerRect.top,
        bottom: topPipeRect.bottom - containerRect.top,
      };

      const adjustedBottom = {
        left: bottomPipeRect.left - containerRect.left,
        right: bottomPipeRect.right - containerRect.left,
        top: bottomPipeRect.top - containerRect.top,
        bottom: bottomPipeRect.bottom - containerRect.top,
      };

      if (
        birdRect.right > adjustedTop.left &&
        birdRect.left < adjustedTop.right &&
        birdRect.top < adjustedTop.bottom
      ) {
        gameOver();
        return;
      }

      if (
        birdRect.right > adjustedBottom.left &&
        birdRect.left < adjustedBottom.right &&
        birdRect.bottom > adjustedBottom.top
      ) {
        gameOver();
        return;
      }
    }
  }

  function gameOver() {
    isGameActive = false;
    cancelAnimationFrame(gameLoop);
    clearInterval(pipeGenerationInterval);
    clearInterval(speedIncreaseInterval); // stop speed increase
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove("hidden");
  }

  function update() {
    if (!isGameActive) return;
    birdVelocity += gravity;
    birdPosition += birdVelocity * 0.1;
    updateBirdPosition();
    movePipes();
    checkCollisions();
    gameLoop = requestAnimationFrame(update);
  }

  init();
});
