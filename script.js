document.addEventListener('DOMContentLoaded', function() {
    const gameBallsContainer = document.getElementById('game-balls-container');
    const gameContainer = document.getElementById('game-container');
    const smallBallsContainer = document.getElementById('small-balls-container');
    const controller = document.getElementById('controller');
    const gameOverMessage = document.getElementById('game-over');
    
    const blueCountElement = document.getElementById('blue-count');
    const greenCountElement = document.getElementById('green-count');
    const redCountElement = document.getElementById('red-count');
    const totalBlueCountElement = document.getElementById('total-blue-count');
    const totalGreenCountElement = document.getElementById('total-green-count');
    const totalRedCountElement = document.getElementById('total-red-count');
    const gameTime = document.getElementById('game-time');
    const startButton = document.getElementById('start-game');
    const colorBlue = document.getElementById('color-blue');
    const colorGreen = document.getElementById('color-green');
    const colorRed = document.getElementById('color-red');
    const highestScoreDisplayList = document.getElementById('highest-score-display-list');
    let highestScores = []; // Array to store highest scoring colors

    let gameContainerSize = 400; // Initial size of game container
    let controllerSize = 50; // Initial size of controller
    let controllerX = gameContainerSize / 2 - controllerSize / 2;
    let controllerY = gameContainerSize / 2 - controllerSize / 2;
    let isDragging = false;

    let selectedColor = ''; // To store the selected color by the user
    let gameRunning = false;

    gameContainer.style.width = `${gameContainerSize}px`;
    gameContainer.style.height = `${gameContainerSize}px`;

    updateControllerPosition();

    // Event listeners for dragging the controller
    controller.addEventListener('mousedown', startDrag);
    controller.addEventListener('touchstart', startDrag);

    function startDrag(event) {
        if (!gameRunning) {
            event.preventDefault();
            isDragging = true;

            if (event.type === 'mousedown') {
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', endDrag);
            } else if (event.type === 'touchstart') {
                document.addEventListener('touchmove', drag);
                document.addEventListener('touchend', endDrag);
            }
        }
    }

    function drag(event) {
        if (!isDragging) return;

        const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;

        const rect = gameContainer.getBoundingClientRect();
        controllerX = clamp(clientX - rect.left - controllerSize / 2, 0, rect.width - controllerSize);
        controllerY = clamp(clientY - rect.top - controllerSize / 2, 0, rect.height - controllerSize);

        updateControllerPosition();

        // Move game container in the opposite direction of controller movement
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const dx = centerX - controllerX;
        const dy = centerY - controllerY;

        gameContainer.style.transform = `translate(${-dx}px, ${-dy}px)`; // Inverse direction

        // Check game over condition
        if (controllerSize >= gameContainerSize) {
            gameOver();
        }

        // Check collision with balls
        checkCollision();
    }

    function endDrag(event) {
        isDragging = false;

        if (event.type === 'mouseup') {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', endDrag);
        } else if (event.type === 'touchend') {
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', endDrag);
        }
    }

    // Function to update controller position
    function updateControllerPosition() {
        controller.style.left = `${controllerX}px`;
        controller.style.top = `${controllerY}px`;
    }

    // Clamp function to limit the position of the controller within the bounds
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Function to display game over message
    function gameOver() {
        gameRunning = false;
        gameOverMessage.style.display = 'block';
        evaluateGameResults();
    }

    // Function to evaluate game results after the game is over

    function evaluateGameResults() {
        // Get the final scores
        // const blueScore = parseInt(blueCountElement.textContent);
        // const greenScore = parseInt(greenCountElement.textContent);
        // const redScore = parseInt(redCountElement.textContent);

        const blueScore = parseInt(totalBlueCountElement.textContent);
        const greenScore = parseInt(totalGreenCountElement.textContent);
        const redScore = parseInt( totalRedCountElement.textContent);

        let highestScore = Math.max(blueScore, greenScore, redScore);
        let highestColor = '';
 
        if (highestScore === blueScore) {
            highestColor = 'blue';
            highestScore = blueScore;
        } else if (highestScore === greenScore) {
            highestColor = 'green';
            highestScore = greenScore;
        } else if (highestScore === redScore) {
            highestColor = 'red';
             highestScore = redScore;
        }

        let resultMessage = '';
        if (selectedColor === highestColor) {
            resultMessage = `Congratulations! You picked ${selectedColor} and it has the highest score (${highestScore}). You win!`;
        } else {
            resultMessage = `You picked ${selectedColor} but ${highestColor} has the highest score (${highestScore}). You lost. Try again!`;
        }

        // Display result message in the game over message element
        gameOverMessage.textContent = resultMessage;
        gameOverMessage.style.display = 'block';
    }

    // Event listener for start game button
    startButton.addEventListener('click', function() {
        if (!gameRunning) {
            // Lock controller movement
            isDragging = false;

            // Reset game stats

            // blueCountElement.textContent = '0';
            // greenCountElement.textContent = '0';
            // redCountElement.textContent = '0';

            totalBlueCountElement.textContent = '0';
            totalGreenCountElement.textContent = '0';
            totalRedCountElement.textContent = '0';

            gameOverMessage.style.display = 'none';
            gameRunning = true;

            // Get selected color
            if (colorBlue.checked) {
                selectedColor = 'blue';
            } else if (colorGreen.checked) {
                selectedColor = 'green';
            } else if (colorRed.checked) {
                selectedColor = 'red';
            } else {
                gameOverMessage.textContent = 'Please select a color before starting the game.';
                gameOverMessage.style.display = 'block';
                gameRunning = false;
                return;
            }

            // Start creating random diagonal balls
            createRandomDiagonalBalls();

            // Set timeout for game over
                 // Get game time from input
                 const gameTimeInSeconds = parseInt(gameTime.value);
                 if (!isNaN(gameTimeInSeconds) && gameTimeInSeconds > 0) {
                     // Set timeout for game over based on user input
                     setTimeout(gameOver, gameTimeInSeconds * 1000);
                 } else {
                     // Default game time if input is invalid or not provided
                     setTimeout(gameOver, 15000); // Default to 15 seconds
                 } // Adjust duration as needed (15 seconds in this example)
        }
    });

    // Function to create random diagonal balls and keep running
    function createRandomDiagonalBalls() {
        setInterval(() => {
            const ball = document.createElement('div');
            const colors = ['blue', 'green', 'red'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            ball.classList.add('ball', 'diagonal', randomColor);
            smallBallsContainer.appendChild(ball);

            // Set random starting position outside the viewport
            const startX = window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            ball.style.left = `${startX}px`;
            ball.style.top = `${startY}px`;

            // Animate ball movement across the screen
            const duration = Math.random() * 3000 + 2000; // Random duration between 2-5 seconds
            const endX = -ball.offsetWidth;

            ball.style.transition = `transform ${duration}ms linear`;
            ball.style.transform = `rotate(-5deg) translate(${endX - startX}px, 0)`;

            // Remove ball after animation ends or when it reaches the left side of the screen
            const removeTimeout = setTimeout(() => {
                ball.remove();
            }, duration);

            // Check if ball reaches the left side of the screen and update collision stats
            const checkInterval = setInterval(() => {
                const ballRect = ball.getBoundingClientRect();
                if (ballRect.left < 0) {
                    clearTimeout(removeTimeout);
                    clearInterval(checkInterval);
                    ball.remove();
                } else {
                    // Check collision with controller
                    const controllerRect = controller.getBoundingClientRect();
                    if (rectsIntersect(controllerRect, ballRect)) {
                        handleCollision(ball);
                    }
                }
            }, 10); // Check every 10ms
        }, 100); // Create a new ball every 0.1 seconds
    }

    // Function to check collision with controller
    function checkCollision() {
        const controllerRect = controller.getBoundingClientRect();
        const balls = document.querySelectorAll('.ball');

        balls.forEach(ball => {
            const ballRect = ball.getBoundingClientRect();
            if (rectsIntersect(controllerRect, ballRect)) {
                handleCollision(ball);
            }
        });
    }

    // Function to handle collision with a ball
    function handleCollision(ball) {
        ball.classList.add('collided');
        const color = ball.classList.contains('blue') ? 'Blue' :
                      ball.classList.contains('green') ? 'Green' :
                      ball.classList.contains('red') ? 'Red' : '';

        if (color) {
            const countElement = document.getElementById(`${color.toLowerCase()}-count`);
            if (countElement) {
                countElement.textContent = parseInt(countElement.textContent) + 1;
            }

            // Update total collision count
            updateTotalCollisionCount(color.toLowerCase());
        }
    }

    // Function to update the total collision count
    function updateTotalCollisionCount(color) {
        if (gameRunning) {
            const totalElement = document.getElementById(`total-${color}-count`);
            if (totalElement) {
                totalElement.textContent = parseInt(totalElement.textContent) + 1;
            }
        }
    }

    // Function to check if two rectangles intersect
    function rectsIntersect(rect1, rect2) {
        return !(rect2.left > rect1.right || 
                 rect2.right < rect1.left || 
                 rect2.top > rect1.bottom ||
                 rect2.bottom < rect1.top);
    }

    // Start creating random diagonal balls immediately
    createRandomDiagonalBalls();
});
