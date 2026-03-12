// UI Elements
const gridContainer = document.getElementById("cwGrid");
const keyboardContainer = document.getElementById("keyboard");
const feedbackDisplay = document.getElementById("answer-feedback");
const btnNext = document.getElementById("btnnext");
const btnCheck = document.getElementById("btncheck");
const scoreDisplay = document.getElementById("cross-score");
const gameBox = document.getElementById("gameBox");
const diffModal = document.getElementById("diffModal");

const GRID_SIZE = 14;

// Game State
let score = parseInt(localStorage.getItem("crossScore")) || 0;
let gridData = [];
let currentCells = [];
let activeCell = null;
let gameOver = false;
let currentDifficulty = "easy"; // default difficulty

// Initialize
function initGame() {
    btnNext.addEventListener('click', () => {
        gameOver = true;
        revealAnswers();
        showFeedback(`Skipping...`, "info");
        setTimeout(loadNewPuzzle, 2500);
    });
    
    btnCheck.addEventListener('click', checkWin);
    document.addEventListener('keydown', handlePhysicalKeyboard);

    // Set up difficulty Modal buttons
    document.querySelectorAll('.modal-diff-group .diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentDifficulty = e.target.dataset.diff;
            diffModal.classList.add('hidden');
            loadNewPuzzle(); // load puzzle for the first time
        });
    });

    updateScore(score);
    buildKeyboard();
    // Do NOT loadNewPuzzle() here so the modal stays open!
}

function updateScore(newScore) {
    score = newScore;
    localStorage.setItem("crossScore", score);
    scoreDisplay.innerText = `SOLVED: ${score}`;
}

function generatePuzzle() {
    gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    currentCells = [];
    
    let validWords = words.filter(w => w.length >= 4 && w.length <= 8);
    let word1 = validWords[Math.floor(Math.random() * validWords.length)];
    let w1Row = Math.floor(GRID_SIZE / 2);
    let w1Col = Math.floor((GRID_SIZE - word1.length) / 2);
    
    let placedWords = [{ wordStr: word1, isHorizontal: true, startRow: w1Row, startCol: w1Col }];
    
    for(let i=0; i<word1.length; i++) {
        gridData[w1Row][w1Col + i] = { target: word1[i], guess: "", hint: false, row: w1Row, col: w1Col + i };
        currentCells.push(gridData[w1Row][w1Col + i]);
    }
    
    let targetWords = 2; // easy limit
    if (currentDifficulty === 'medium') targetWords = 3;
    if (currentDifficulty === 'hard') targetWords = 5;
    
    let failedAttempts = 0;
    while (placedWords.length < targetWords && failedAttempts < 100) {
        let baseWord = placedWords[Math.floor(Math.random() * placedWords.length)];
        let intersectIdx = Math.floor(Math.random() * baseWord.wordStr.length);
        let char = baseWord.wordStr[intersectIdx];
        
        let candidates = validWords.filter(w => !placedWords.some(pw => pw.wordStr === w) && w.includes(char));
        if (candidates.length === 0) { failedAttempts++; continue; }
        
        let candidate = candidates[Math.floor(Math.random() * candidates.length)];
        let intersectCandidateIdx = candidate.indexOf(char);
        
        let isHorizontal = !baseWord.isHorizontal;
        let startRow = isHorizontal ? baseWord.startRow + intersectIdx : baseWord.startRow - intersectCandidateIdx;
        let startCol = isHorizontal ? baseWord.startCol - intersectCandidateIdx : baseWord.startCol + intersectIdx;
        
        let collision = false;
        if (isHorizontal) {
            if (startCol < 0 || startCol + candidate.length > GRID_SIZE) collision = true;
        } else {
            if (startRow < 0 || startRow + candidate.length > GRID_SIZE) collision = true;
        }
        
        if (!collision) {
            for(let i=0; i<candidate.length; i++) {
                if (i === intersectCandidateIdx) continue;
                let r = isHorizontal ? startRow : startRow + i;
                let c = isHorizontal ? startCol + i : startCol;
                
                if (gridData[r][c] !== null) { collision = true; break; }
                
                if (isHorizontal) {
                    if (r-1 >= 0 && gridData[r-1][c] !== null) { collision = true; break; }
                    if (r+1 < GRID_SIZE && gridData[r+1][c] !== null) { collision = true; break; }
                    if (i === 0 && c-1 >= 0 && gridData[r][c-1] !== null) { collision = true; break; }
                    if (i === candidate.length-1 && c+1 < GRID_SIZE && gridData[r][c+1] !== null) { collision = true; break; }
                } else {
                    if (c-1 >= 0 && gridData[r][c-1] !== null) { collision = true; break; }
                    if (c+1 < GRID_SIZE && gridData[r][c+1] !== null) { collision = true; break; }
                    if (i === 0 && r-1 >= 0 && gridData[r-1][c] !== null) { collision = true; break; }
                    if (i === candidate.length-1 && r+1 < GRID_SIZE && gridData[r+1][c] !== null) { collision = true; break; }
                }
            }
        }
        
        if (!collision) {
            placedWords.push({ wordStr: candidate, isHorizontal: isHorizontal, startRow: startRow, startCol: startCol });
            for(let i=0; i<candidate.length; i++) {
                if (i !== intersectCandidateIdx) {
                    let r = isHorizontal ? startRow : startRow + i;
                    let c = isHorizontal ? startCol + i : startCol;
                    gridData[r][c] = { target: candidate[i], guess: "", hint: false, row: r, col: c };
                    currentCells.push(gridData[r][c]);
                }
            }
        } else {
            failedAttempts++;
        }
    }
    
    // Reboot if generation failed to place expected number of connections
    if (placedWords.length < targetWords) return generatePuzzle();

    // Set Hints based on difficulty
    let hintRatio = 0.4; // Easy: 40%
    if (currentDifficulty === "medium") hintRatio = 0.25; // Medium: 25%
    if (currentDifficulty === "hard") hintRatio = 0.10; // Hard: 10%
    
    let numHints = Math.max(1, Math.floor(currentCells.length * hintRatio));
    if (currentDifficulty === "easy" && numHints < 3) numHints = Math.min(3, currentCells.length - 1); 

    let shuf = [...currentCells].sort(() => 0.5 - Math.random());
    for(let i=0; i<numHints; i++) {
        shuf[i].hint = true;
        shuf[i].guess = shuf[i].target;
    }
}

function renderGrid() {
    gridContainer.innerHTML = '';
    
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let cellData = gridData[r][c];
            let cellDiv = document.createElement("div");
            cellDiv.classList.add("cw-cell");
            
            if (cellData) {
                cellDiv.classList.add("active-cell");
                if (cellData.hint) {
                    cellDiv.classList.add("hint-cell");
                    cellDiv.innerText = cellData.target;
                } else {
                    cellDiv.innerText = cellData.guess;
                    cellDiv.addEventListener('click', () => selectCell(r, c));
                }
                cellDiv.id = `cell-${r}-${c}`;
            }
            gridContainer.appendChild(cellDiv);
        }
    }
}

function selectCell(r, c) {
    if (gameOver) return;
    activeCell = {row: r, col: c};
    
    document.querySelectorAll('.cw-cell').forEach(el => el.classList.remove('selected'));
    document.getElementById(`cell-${r}-${c}`).classList.add('selected');
}

function handlePhysicalKeyboard(e) {
    if (gameOver || !activeCell) return;
    if (e.key === "Backspace") handleInput("backspace");
    if (e.key === "Enter") checkWin();
    if (/^[a-zA-Z]$/.test(e.key)) handleInput(e.key.toLowerCase());
}

function buildKeyboard() {
    keyboardContainer.innerHTML = "";
    const rows = [
        "qwertyuiop".split(""),
        "asdfghjkl".split(""),
        ["enter", ...("zxcvbnm".split("")), "backspace"]
    ];
    
    rows.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");
        
        row.forEach(key => {
            const btn = document.createElement("button");
            btn.classList.add("key-btn");
            if (key === "enter") btn.innerText = "ENT", btn.classList.add("key-wide");
            else if (key === "backspace") btn.innerText = "DEL", btn.classList.add("key-wide");
            else btn.innerText = key;
            
            btn.addEventListener("click", () => handleInput(key));
            rowDiv.appendChild(btn);
        });
        
        keyboardContainer.appendChild(rowDiv);
    });
}

function handleInput(key) {
    if (gameOver || !activeCell) return;
    
    let r = activeCell.row;
    let c = activeCell.col;
    let cellData = gridData[r][c];
    let cellDiv = document.getElementById(`cell-${r}-${c}`);
    
    if (key === "backspace") {
        cellData.guess = "";
        cellDiv.innerText = "";
        cellDiv.classList.remove("error");
    } else if (key === "enter") {
        checkWin();
    } else if (/^[a-z]$/.test(key)) {
        cellData.guess = key;
        cellDiv.innerText = key;
        cellDiv.classList.remove("error");
    }
}

function checkWin() {
    if (gameOver) return;
    
    let isFull = true;
    let isCorrect = true;
    
    // Check all interactive cells
    for(let cell of currentCells) {
        if (!cell.hint) {
            if (cell.guess === "") isFull = false;
            
            if (cell.guess !== "" && cell.guess !== cell.target) {
                isCorrect = false;
                document.getElementById(`cell-${cell.row}-${cell.col}`).classList.add("error");
            }
        }
    }
    
    if (!isFull) {
        showFeedback("Fill in all missing letters first!", "info");
        return;
    }
    
    if (isCorrect) {
        gameOver = true;
        showFeedback("Crossword Solved! 🎉", "correct");
        updateScore(score + 1);
        setTimeout(loadNewPuzzle, 2000);
    } else {
        showFeedback("Some letters are incorrect. Keep trying!", "incorrect");
        gameBox.classList.remove("shake");
        void gameBox.offsetWidth;
        gameBox.classList.add("shake");
    }
}

function revealAnswers() {
    for(let cell of currentCells) {
        if (!cell.hint) {
            let el = document.getElementById(`cell-${cell.row}-${cell.col}`);
            el.innerText = cell.target;
            el.style.color = "var(--error)";
        }
    }
}

function loadNewPuzzle() {
    gameOver = false;
    activeCell = null;
    hideFeedback();
    generatePuzzle();
    renderGrid();
}

function showFeedback(message, type) {
    feedbackDisplay.className = ""; 
    feedbackDisplay.classList.add("show");
    if (type) feedbackDisplay.classList.add(type);
    feedbackDisplay.innerText = message;
    
    if (type !== "info") {
        setTimeout(() => { if(!gameOver) feedbackDisplay.classList.remove("show"); }, 2000);
    }
}

function hideFeedback() {
    feedbackDisplay.classList.remove("show");
}

initGame();
