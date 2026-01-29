// Ludo Game Script
// Author: Jules
// Description: Main game logic for Ludo

console.log('Ludo Game Initialized');

const boardElement = document.querySelector('.ludo-board');

// SVG Icons
const SVG_LOCK = '<svg viewBox="0 0 24 24" class="icon"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-9-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>';
const SVG_STAR = '<svg viewBox="0 0 24 24" class="icon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

// Configuration
// Rows and Cols are 1-based for CSS Grid
const BOARD_SIZE = 15;

function isBase(r, c) {
    // TL (1-6, 1-6)
    if (r <= 6 && c <= 6) return true;
    // TR (1-6, 10-15)
    if (r <= 6 && c >= 10) return true;
    // BL (10-15, 1-6)
    if (r >= 10 && c <= 6) return true;
    // BR (10-15, 10-15)
    if (r >= 10 && c >= 10) return true;
    return false;
}

function isCenter(r, c) {
    return r >= 7 && r <= 9 && c >= 7 && c <= 9;
}

function renderBoard() {
    for (let r = 1; r <= BOARD_SIZE; r++) {
        for (let c = 1; c <= BOARD_SIZE; c++) {
            if (isBase(r, c) || isCenter(r, c)) continue;

            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.gridRow = r;
            cell.style.gridColumn = c;
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Determine Start/Home/Safe
            applyCellProperties(cell, r, c);

            boardElement.appendChild(cell);
        }
    }
}

function applyCellProperties(cell, r, c) {
    // Home Columns (The colored tracks leading to center)
    // Blue Home: R8, C2-6
    if (r === 8 && c >= 2 && c <= 6) {
        cell.classList.add('cell-home-blue');
    }
    // Green Home: R2-6, C8
    if (c === 8 && r >= 2 && r <= 6) {
        cell.classList.add('cell-home-green');
    }
    // Red Home: R8, C10-14
    if (r === 8 && c >= 10 && c <= 14) {
        cell.classList.add('cell-home-red');
    }
    // Yellow Home: R10-14, C8
    if (c === 8 && r >= 10 && r <= 14) {
        cell.classList.add('cell-home-yellow');
    }

    // Start Positions (Locks)
    // Blue Start: R7, C2
    if (r === 7 && c === 2) {
        cell.classList.add('cell-start-blue');
        cell.innerHTML = SVG_LOCK;
    }
    // Green Start: R2, C9 (Top Arm, Right Col)
    if (r === 2 && c === 9) {
        cell.classList.add('cell-start-green');
        cell.innerHTML = SVG_LOCK;
    }
    // Red Start: R9, C14 (Right Arm, Bottom Row)
    if (r === 9 && c === 14) {
        cell.classList.add('cell-start-red');
        cell.innerHTML = SVG_LOCK;
    }
    // Yellow Start: R14, C7 (Bottom Arm, Left Col)
    if (r === 14 && c === 7) {
        cell.classList.add('cell-start-yellow');
        cell.innerHTML = SVG_LOCK;
    }

    // Safe Zones (Stars)
    // Blue Star: R3, C7
    if (r === 3 && c === 7) {
        cell.classList.add('safe-zone');
        cell.innerHTML = SVG_STAR;
    }
    // Green Star: R7, C13
    if (r === 7 && c === 13) {
        cell.classList.add('safe-zone');
        cell.innerHTML = SVG_STAR;
    }
    // Red Star: R13, C9
    if (r === 13 && c === 9) {
        cell.classList.add('safe-zone');
        cell.innerHTML = SVG_STAR;
    }
    // Yellow Star: R9, C3
    if (r === 9 && c === 3) {
        cell.classList.add('safe-zone');
        cell.innerHTML = SVG_STAR;
    }
}

renderBoard();

// UI References
const diceContainer = document.getElementById('dice-container');
const diceElement = document.getElementById('dice');
const statusMessage = document.getElementById('status-message');

// Token Initialization
function createTokens() {
    const colors = ['blue', 'green', 'red', 'yellow'];

    colors.forEach(color => {
        const baseInner = document.querySelector(`#base-${color} .base-inner`);
        for (let i = 0; i < 4; i++) {
            const token = document.createElement('div');
            token.classList.add('token', `token-${color}`);
            token.dataset.color = color;
            token.dataset.index = i;
            // Initially inside base, we can use simple appending
            // The .base-inner is a grid 2x2, so they will flow automatically
            baseInner.appendChild(token);
        }
    });
}

createTokens();

// Game State & Coordinate Logic
const DEBUG_MODE = true;

// Generate Main Path Coordinates (0-51)
const COORDINATES_MAP = [];

function generateCoordinates() {
    // Defines the sequence of 52 cells
    // Segment 1: Blue Start area to Top Left
    // R7 C2 -> R7 C6 (5)
    for (let c = 2; c <= 6; c++) COORDINATES_MAP.push({r: 7, c: c});

    // Segment 2: Up Top Arm (Left col)
    // R6 C7 -> R1 C7 (6)
    for (let r = 6; r >= 1; r--) COORDINATES_MAP.push({r: r, c: 7});

    // Segment 3: Top Arm Top (Middle & Right)
    // R1 C8 -> R1 C9 (2)
    COORDINATES_MAP.push({r: 1, c: 8});
    COORDINATES_MAP.push({r: 1, c: 9});

    // Segment 4: Down Top Arm (Right col)
    // R2 C9 -> R6 C9 (5)
    for (let r = 2; r <= 6; r++) COORDINATES_MAP.push({r: r, c: 9});

    // Segment 5: Right Arm Top (Top row)
    // R7 C10 -> R7 C15 (6)
    for (let c = 10; c <= 15; c++) COORDINATES_MAP.push({r: 7, c: c});

    // Segment 6: Right Arm Right (Middle & Bottom)
    // R8 C15 -> R9 C15 (2)
    COORDINATES_MAP.push({r: 8, c: 15});
    COORDINATES_MAP.push({r: 9, c: 15});

    // Segment 7: Right Arm Bottom
    // R9 C14 -> R9 C10 (5)
    for (let c = 14; c >= 10; c--) COORDINATES_MAP.push({r: 9, c: c});

    // Segment 8: Down Bottom Arm (Right col)
    // R10 C9 -> R15 C9 (6)
    for (let r = 10; r <= 15; r++) COORDINATES_MAP.push({r: r, c: 9});

    // Segment 9: Bottom Arm Bottom (Middle & Left)
    // R15 C8 -> R15 C7 (2)
    COORDINATES_MAP.push({r: 15, c: 8});
    COORDINATES_MAP.push({r: 15, c: 7});

    // Segment 10: Up Bottom Arm (Left col)
    // R14 C7 -> R10 C7 (5)
    for (let r = 14; r >= 10; r--) COORDINATES_MAP.push({r: r, c: 7});

    // Segment 11: Left Arm Bottom
    // R9 C6 -> R9 C1 (6)
    for (let c = 6; c >= 1; c--) COORDINATES_MAP.push({r: 9, c: c});

    // Segment 12: Left Arm Left
    // R8 C1 -> R7 C1 (2)
    COORDINATES_MAP.push({r: 8, c: 1});
    COORDINATES_MAP.push({r: 7, c: 1});

    // Total should be 52
    console.log('Coordinates Map Size:', COORDINATES_MAP.length);
}

generateCoordinates();

const HOME_PATH_MAP = {
    blue:   [{r:8, c:2}, {r:8, c:3}, {r:8, c:4}, {r:8, c:5}, {r:8, c:6}, {r:8, c:7}], // Last one is center/near center
    green:  [{r:2, c:8}, {r:3, c:8}, {r:4, c:8}, {r:5, c:8}, {r:6, c:8}, {r:7, c:8}],
    red:    [{r:8, c:14}, {r:8, c:13}, {r:8, c:12}, {r:8, c:11}, {r:8, c:10}, {r:8, c:9}],
    yellow: [{r:14, c:8}, {r:13, c:8}, {r:12, c:8}, {r:11, c:8}, {r:10, c:8}, {r:9, c:8}]
};

// Start Indices on Main Path
const START_INDEX = {
    blue: 0,
    green: 13,
    red: 26,
    yellow: 39
};

// Turning Points (Last index before entering Home)
const TURNING_POINT = {
    blue: 51,
    green: 12,
    red: 25,
    yellow: 38
};

// Game State
const gameState = {
    players: ['blue', 'red', 'green', 'yellow'], // Order per prompt
    turn: 0, // Index of current player
    diceValue: 0,
    waitingForMove: false,
    consecutiveSixes: 0,
    pieces: {
        // Track status of 4 pieces for each color
        // status: 'BASE', 'active', 'FINISHED'
        // travelled: -1 (Base), 0-50 (Path), 51-56 (Home Path). 56 is Goal.
        // position: current mapped index (for collision checks) - strictly 0-51.
        blue:   [...Array(4)].map((_, i) => ({ id: `blue-${i}`, status: 'BASE', travelled: -1, element: null })),
        green:  [...Array(4)].map((_, i) => ({ id: `green-${i}`, status: 'BASE', travelled: -1, element: null })),
        red:    [...Array(4)].map((_, i) => ({ id: `red-${i}`, status: 'BASE', travelled: -1, element: null })),
        yellow: [...Array(4)].map((_, i) => ({ id: `yellow-${i}`, status: 'BASE', travelled: -1, element: null }))
    }
};

// Link JS objects to DOM elements & Add Click Listeners
function linkPieces() {
    ['blue', 'green', 'red', 'yellow'].forEach(color => {
        const tokens = document.querySelectorAll(`.token-${color}`);
        tokens.forEach((token, index) => {
            gameState.pieces[color][index].element = token;
            token.addEventListener('click', () => onTokenClick(color, index));
        });
    });
}
linkPieces();

function onTokenClick(color, index) {
    if (!gameState.waitingForMove) return;
    if (gameState.players[gameState.turn] !== color) return;

    // Check if this token is valid
    const validMoves = getValidMoves(color, gameState.diceValue);
    if (validMoves.includes(index)) {
        gameState.waitingForMove = false;
        clearHighlights();
        movePiece(color, index, gameState.diceValue);
    }
}

// Dice Logic
diceElement.addEventListener('click', () => {
    if (gameState.waitingForMove) return;
    rollDice();
});

function rollDice() {
    diceElement.classList.add('dice-shake');

    setTimeout(() => {
        diceElement.classList.remove('dice-shake');

        let roll;
        if (DEBUG_MODE) {
            const input = prompt("Enter dice value (1-6):");
            roll = parseInt(input);
            if (isNaN(roll) || roll < 1 || roll > 6) roll = Math.floor(Math.random() * 6) + 1;
        } else {
            roll = Math.floor(Math.random() * 6) + 1;
        }

        gameState.diceValue = roll;
        diceElement.textContent = roll;

        handleRollResult(roll);
    }, 500);
}

function handleRollResult(roll) {
    const player = gameState.players[gameState.turn];
    const playerCap = player.charAt(0).toUpperCase() + player.slice(1);
    console.log(`${player} rolled ${roll}`);

    if (roll === 6) {
        gameState.consecutiveSixes++;
        if (gameState.consecutiveSixes === 3) {
            console.log("Three consecutive 6s! Turn forfeited.");
            statusMessage.textContent = `${playerCap} rolled three 6s! Turn Lost.`;
            setTimeout(changeTurn, 1500);
            return;
        }
    } else {
        gameState.consecutiveSixes = 0;
    }

    const validMoves = getValidMoves(player, roll);

    if (validMoves.length === 0) {
        console.log("No valid moves.");
        statusMessage.textContent = `No moves for ${playerCap}.`;
        // If it was a 6 (but no moves, e.g. blocked?), they still get a bonus roll?
        // Standard rules: If you roll 6, you get another turn. Even if you can't move?
        // Usually yes. But if you can't move 6, you can't move.
        // If I assume strict: No move = Turn passes, unless it's a 6, then maybe roll again?
        // Simpler: No move -> Next player. (Even if 6).
        // BUT prompt says: "If a player rolls a 6, they get an immediate bonus roll."
        // I will implement: If 6, allow rolling again even if no move?
        // Or does "Bonus roll" imply you must play the 6?
        // "Edge Case: If a player rolls 6 three times... forfeited".
        // I'll stick to: If 6, you get to roll again. If you can't move the 6, you just roll again.

        if (roll === 6 && gameState.consecutiveSixes < 3) {
             statusMessage.textContent = `No moves, but rolled 6! Roll again.`;
             // Stay in turn, unlock dice
             return;
        }

        setTimeout(changeTurn, 1500);
    } else {
        // Highlight pieces, wait for click
        statusMessage.textContent = `${playerCap}'s Turn - Move a piece`;
        gameState.waitingForMove = true;
        highlightValidPieces(validMoves);

        // Auto-move if only 1 move
        if (validMoves.length === 1) {
             const index = validMoves[0];
             console.log("Auto-moving piece", index);
             gameState.waitingForMove = false; // Disable input
             setTimeout(() => {
                 clearHighlights();
                 movePiece(player, index, roll);
             }, 800); // Small delay to see dice
        }
    }
}

function changeTurn() {
    gameState.turn = (gameState.turn + 1) % 4;
    gameState.consecutiveSixes = 0;
    gameState.waitingForMove = false;
    gameState.diceValue = 0;

    const nextPlayer = gameState.players[gameState.turn];
    statusMessage.textContent = `${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)}'s Turn`;
    diceElement.textContent = "Roll";

    // Update Dice Position
    diceContainer.className = 'dice-container'; // Reset
    diceContainer.classList.add(`dice-pos-${nextPlayer}`); // Position class

    // Clear highlights
    clearHighlights();
}

// Movement Logic

const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

function getValidMoves(player, roll) {
    const moves = [];
    const pieces = gameState.pieces[player];

    pieces.forEach((piece, index) => {
        if (piece.status === 'FINISHED') return;

        if (piece.status === 'BASE') {
            if (roll === 6) moves.push(index);
            return;
        }

        // Active piece
        const currentTravelled = piece.travelled;
        const targetTravelled = currentTravelled + roll;

        // Check bounds (Max 56)
        if (targetTravelled > 56) return;

        // Check Collision rules?
        // In Ludo, you can usually jump over pieces? Yes.
        // But you can't land on own piece?
        // Prompt says: "Stacking: Two pieces of the same color can occupy the same spot."
        // So self-stacking is allowed anywhere.

        // So basic move is valid unless > 56.
        moves.push(index);
    });

    return moves;
}

function highlightValidPieces(pieceIndices) {
    const player = gameState.players[gameState.turn];
    pieceIndices.forEach(index => {
        const token = gameState.pieces[player][index].element;
        token.classList.add('valid-move');
    });
}

function clearHighlights() {
    document.querySelectorAll('.token').forEach(t => t.classList.remove('valid-move'));
}

async function movePiece(color, index, steps) {
    const piece = gameState.pieces[color][index];

    // Coming out of Base
    if (piece.status === 'BASE') {
        piece.status = 'active';
        piece.travelled = 0;
        updatePiecePosition(color, index);

        // 6 gives bonus
        statusMessage.textContent = "Moved out! Roll again.";
        return; // Dice is still active because we didn't call changeTurn()
        // But we need to ensure the user CAN roll again.
        // gameState.waitingForMove = false (handled in onTokenClick)
        // We do NOT call changeTurn.
    }

    // Step-by-step movement
    for (let i = 1; i <= steps; i++) {
        piece.travelled++;
        updatePiecePosition(color, index);
        // Play sound?
        await new Promise(r => setTimeout(r, 300));
    }

    handlePostMove(color, index);
}

function updatePiecePosition(color, index) {
    const piece = gameState.pieces[color][index];
    const token = piece.element;

    if (piece.status === 'BASE') {
        // Should be back in base logic, but usually handled by specific logic if sending back
        const baseInner = document.querySelector(`#base-${color} .base-inner`);
        baseInner.appendChild(token);
        return;
    }

    let r, c;

    if (piece.travelled <= 50) {
        // Main Path
        const startIdx = START_INDEX[color];
        const mapIdx = (startIdx + piece.travelled) % 52;
        const coord = COORDINATES_MAP[mapIdx];
        r = coord.r;
        c = coord.c;
    } else {
        // Home Path
        const homeIdx = piece.travelled - 51;
        if (homeIdx === 5) { // Goal (Center)
            // Just center visual
             r = 8; c = 8; // Approx center
             // Or use specific home map
        }
        if (homeIdx < 6) {
             const coord = HOME_PATH_MAP[color][homeIdx];
             if (coord) {
                 r = coord.r;
                 c = coord.c;
             }
        }
    }

    if (r !== undefined && c !== undefined) {
        // Find the cell at r,c
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        if (cell) {
             cell.appendChild(token); // Moves it to the new parent
        } else if (r === 8 && c === 8) {
             // Center Triangle
             // We can append to home-triangle?
             // But home-triangle is a single div.
             // We can just create a cell-like wrapper or append to .ludo-board and position absolute?
             // Or append to .home-triangle
             const homeTri = document.querySelector('.home-triangle');
             // Center pieces style
             token.style.position = 'absolute';
             // Random offset to see them
             token.style.top = '40%';
             token.style.left = '40%';
             homeTri.appendChild(token);
        }
    }
}

function handlePostMove(color, index) {
    const piece = gameState.pieces[color][index];

    // Check Win (Goal)
    if (piece.travelled === 56) {
        piece.status = 'FINISHED';
        console.log("Piece Finished!");
        // Check Game Win
        if (gameState.pieces[color].every(p => p.status === 'FINISHED')) {
            alert(`${color.toUpperCase()} WINS!`);
            location.reload();
            return;
        }
        // Bonus turn for finishing? usually yes.
        statusMessage.textContent = "Piece Finished! Bonus Roll.";
        return;
    }

    // Check Collision
    // Get board index
    let boardIdx = -1;
    if (piece.travelled <= 50) {
        boardIdx = (START_INDEX[color] + piece.travelled) % 52;
    }

    let cutOpponent = false;

    if (boardIdx !== -1) {
        // Check if Safe Zone
        const isSafe = SAFE_INDICES.includes(boardIdx);

        if (!isSafe) {
            // Check other players
            gameState.players.forEach(pColor => {
                if (pColor === color) return;

                gameState.pieces[pColor].forEach(oppPiece => {
                    if (oppPiece.status !== 'active') return;
                    // Check opp position
                    if (oppPiece.travelled <= 50) {
                         const oppIdx = (START_INDEX[pColor] + oppPiece.travelled) % 52;
                         if (oppIdx === boardIdx) {
                             // Cut!
                             console.log(`Cut ${pColor} piece!`);
                             cutPiece(pColor, oppPiece.id.split('-')[1]);
                             cutOpponent = true;
                         }
                    }
                });
            });
        }
    }

    // Rules for next turn:
    // If rolled 6 -> Bonus Roll (Already handled? No, rollDice doesn't change turn if 6)
    // If Cut Opponent -> Bonus Roll.

    const rolledSix = (gameState.diceValue === 6);

    if (rolledSix || cutOpponent) {
        statusMessage.textContent = cutOpponent ? "Cut Opponent! Bonus Roll." : "Rolled 6! Roll again.";
        // Don't change turn.
        // Dice is already unlocked effectively (waitingForMove is false).
        // User must click dice.
    } else {
        changeTurn();
    }
}

function cutPiece(color, index) {
    const piece = gameState.pieces[color][index];
    piece.status = 'BASE';
    piece.travelled = -1;
    updatePiecePosition(color, index);
}
