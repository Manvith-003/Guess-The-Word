// UI Elements
const wordDisplay = document.getElementById("wordDisplay");
const keyboardContainer = document.getElementById("keyboard");
const feedbackDisplay = document.getElementById("answer-feedback");
const livesDisplay = document.getElementById("lives");
const btnNext = document.getElementById("btnnext");
const scoreDisplay = document.getElementById("spaceman-score");
const gameBox = document.getElementById("gameBox");

// Score and Game State
let score = parseInt(localStorage.getItem("spacemanScore")) || 0;
let currentWord = "";
let availableWords = [...words]; // Loads from words.js
let guessedLetters = [];
let maxLives = 7;
let currentLives = maxLives;
let gameOver = false;

// Initialize
function initGame() {
    btnNext.addEventListener('click', loadNewWord);
    
    // Physical keyboard support
    document.addEventListener('keydown', handlePhysicalKeyboard);

    updateScore(score);
    buildKeyboard();
    loadNewWord();
}

// Dynamically build the visual keyboard
function buildKeyboard() {
    keyboardContainer.innerHTML = "";
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    
    alphabet.forEach(letter => {
        const btn = document.createElement("button");
        btn.innerText = letter;
        btn.classList.add("key-btn");
        btn.dataset.letter = letter;
        btn.addEventListener("click", () => handleGuess(letter));
        keyboardContainer.appendChild(btn);
    });
}

// Handle physical keyboard typing
function handlePhysicalKeyboard(e) {
    if (gameOver) return;
    const letter = e.key.toLowerCase();
    
    if (/^[a-z]$/.test(letter)) {
        handleGuess(letter);
    }
}

function updateScore(newScore) {
    score = newScore;
    localStorage.setItem("spacemanScore", score);
    scoreDisplay.innerText = `SCORE: ${score}`;
}

function loadNewWord() {
    if (availableWords.length === 0) {
        // Refill pool
        availableWords = [...words];
        availableWords.sort(() => Math.random() - 0.5);
    }
    
    // Pick the next word from the pool
    currentWord = availableWords.pop();
    guessedLetters = [];
    currentLives = maxLives;
    gameOver = false;
    
    // Reset visual keyboard buttons FIRST
    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.classList.remove("correct", "incorrect");
        btn.disabled = false;
    });
    
    // Reveal a few hint letters based on word length
    const uniqueLetters = [...new Set(currentWord.split(''))];
    let numHints = 1;
    if (currentWord.length >= 6) numHints = 2;
    if (currentWord.length >= 9) numHints = 3;
    
    // Safety check so we don't reveal the entire word
    if (numHints >= uniqueLetters.length) {
        numHints = Math.max(0, uniqueLetters.length - 1);
    }
    
    for (let i = 0; i < numHints; i++) {
        const unrevealedLetters = uniqueLetters.filter(l => !guessedLetters.includes(l));
        if (unrevealedLetters.length > 0) {
            const randomHint = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
            guessedLetters.push(randomHint);
            
            // Mark the hint on the visual keyboard so user knows it's guessed
            const btn = document.querySelector(`.key-btn[data-letter="${randomHint}"]`);
            if (btn) {
                btn.classList.add("correct");
                btn.disabled = true;
            }
        }
    }
    
    // Update main UI
    updateWordDisplay();
    updateLivesDisplay();
    hideFeedback();
    wordDisplay.style.color = "var(--text-primary)";
}

function updateWordDisplay() {
    let displayString = currentWord.split('').map(letter => {
        return guessedLetters.includes(letter) ? letter : "_";
    }).join(" ");
    
    wordDisplay.innerText = displayString;
}

function updateLivesDisplay() {
    livesDisplay.innerText = "❤️".repeat(currentLives) + "💔".repeat(maxLives - currentLives);
}

function showFeedback(message, type) {
    feedbackDisplay.className = ""; 
    feedbackDisplay.classList.add("show");
    
    if (type) feedbackDisplay.classList.add(type);
    
    feedbackDisplay.innerText = message;
    
    if (type !== "info") {
        setTimeout(() => {
            if(!gameOver) feedbackDisplay.classList.remove("show");
        }, 2000);
    }
}

function hideFeedback() {
    feedbackDisplay.classList.remove("show");
}

function handleGuess(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    
    // Find the visual button to update it
    const btn = document.querySelector(`.key-btn[data-letter="${letter}"]`);
    if(btn) btn.disabled = true;

    if (currentWord.includes(letter)) {
        // Correct guess
        if(btn) btn.classList.add("correct");
        updateWordDisplay();
        checkWin();
    } else {
        // Incorrect guess
        if(btn) btn.classList.add("incorrect");
        currentLives--;
        updateLivesDisplay();
        
        // Shake animation
        gameBox.classList.remove("shake");
        void gameBox.offsetWidth;
        gameBox.classList.add("shake");
        
        checkLoss();
    }
}

function checkWin() {
    const isWon = currentWord.split('').every(letter => guessedLetters.includes(letter));
    if (isWon) {
        gameOver = true;
        showFeedback("Launch Successful! 🎉", "correct");
        updateScore(score + 1);
        
        setTimeout(() => {
            loadNewWord();
        }, 1500);
    }
}

function checkLoss() {
    if (currentLives <= 0) {
        gameOver = true;
        
        // Show the missed word in red
        wordDisplay.innerText = currentWord.split('').join(" ");
        wordDisplay.style.color = "var(--error)";
        
        showFeedback(`Ship Destroyed!`, "incorrect");
        
        // Wait 3 seconds before next word
        setTimeout(() => {
            loadNewWord();
        }, 3000);
    }
}

// Start Game
initGame();
