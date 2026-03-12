// UI Elements
const questionDisplay = document.getElementById("question");
const inputField = document.getElementById("text");
const feedbackDisplay = document.getElementById("answer-feedback");
const btnCheck = document.getElementById("btncheck");
const btnNext = document.getElementById("btnnext");
const scoreDisplay = document.getElementById("point");
const gameBox = document.getElementById("gameBox");

// 'words' array is now loaded globally via words.js

let score = parseInt(localStorage.getItem("guessTheWordScore")) || 0;
let currentWord = "";
let availableWords = [];
function shuffleLetters(word) {
    let letters = word.split('');
    let shuffled;
    
    // Ensure the shuffled word is not exactly the same as the original, unless it's impossible to shuffle
    do {
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        shuffled = letters.join('');
    } while (shuffled === word && letters.length > 1);

    return shuffled;
}

function updateScore(newScore) {
    score = newScore;
    localStorage.setItem("guessTheWordScore", score);
    scoreDisplay.innerText = `SCORE: ${score}`;
}

function showFeedback(message, type) {
    feedbackDisplay.className = ""; // Reset classes
    feedbackDisplay.classList.add("show");
    
    if (type) {
        feedbackDisplay.classList.add(type);
    }
    
    feedbackDisplay.innerText = message;
    
    // Auto-hide feedback after a few seconds unless it's showing the answer permanently
    if (type !== "info") {
        setTimeout(() => {
            feedbackDisplay.classList.remove("show");
        }, 2000);
    }
}

function hideFeedback() {
    feedbackDisplay.classList.remove("show");
}

function initGame() {
    // Basic setup, bindings
    btnCheck.addEventListener('click', checkCorrect);
    btnNext.addEventListener('click', loadNewWord);
    
    // Enter key support
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkCorrect();
        }
    });

    // Display initial score from localStorage
    updateScore(score);

    loadNewWord();
}

function loadNewWord() {
    if (availableWords.length === 0) {
        // Refill and shuffle the pool
        availableWords = [...words];
        availableWords.sort(() => Math.random() - 0.5);
        
        // Ensure the next word isn't the same as the last played word
        if (availableWords[availableWords.length - 1] === currentWord && availableWords.length > 1) {
            [availableWords[availableWords.length - 1], availableWords[0]] = 
                [availableWords[0], availableWords[availableWords.length - 1]];
        }
    }
    
    // Pick the next word from the pool
    currentWord = availableWords.pop();
    
    // Shuffle it
    const scrambledWord = shuffleLetters(currentWord);
    
    // Update UI
    questionDisplay.innerText = scrambledWord;
    inputField.value = "";
    inputField.focus();
    
    // Reset buttons and feedback
    btnCheck.disabled = false;
    hideFeedback();
}

function checkCorrect() {
    if (btnCheck.disabled) return;

    const userAnswer = inputField.value.trim().toLowerCase();
    
    if (userAnswer === "") {
        return; // do nothing if empty
    }

    if (userAnswer === currentWord) {
        showFeedback("Correct! 🎉", "correct");
        updateScore(score + 1);
        
        btnCheck.disabled = true;

        // Automatically load next word after a short delay
        setTimeout(() => {
            loadNewWord();
        }, 1500);

    } else {
        showFeedback("Incorrect, try again!", "incorrect");
        
        // Add shake animation
        gameBox.classList.remove("shake");
        // Trigger reflow
        void gameBox.offsetWidth;
        gameBox.classList.add("shake");
        
        inputField.value = "";
        inputField.focus();
    }
}