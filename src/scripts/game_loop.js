/*
Main script for game.html
*/

import * as API from './api_calls.js';
import { state } from './data.js';
import * as popups from './game_popups.js'
import { convertMove, fieldToString, 
    moveStringFromSelection, pieceCharToString } from './var_helpers.js'

export async function initGame() {
    // Create new session
    const session = await API.createSession("myboard", state.abortController.signal);
    if (!session) return;
    state.boardid = session.boardid;
    state.password = session.password;

    // Register as player
    const registration = await API.registerSession(state.boardid, state.password, state.ownColor, state.abortController.signal);
    if (!registration) return;
    state.ownToken = registration.token;

    // Register enemy
    if (!state.isBotExternal) {
        const enemyRegistration = await API.registerSession(state.boardid, state.password, state.enemyColor, state.abortController.signal);
        if (!enemyRegistration) return;
        state.enemyToken = enemyRegistration.token;
    } else {
        popups.displayBotRegistrationPopup();
        
        // Wait for bot registration / game start
        try {
            await API.waitForTurn(state.boardid, "w", state.password, state.abortController.signal);
        } catch (err) {
            // Other errors are being caught at a lower level already
            if (err.name === "AbortError") {
                return; 
            }
        }
        
        popups.closeBotRegistrationPopup();
    }

    // Create internal bot board state
    state.botBoardState = state.bot.bot_create_board();

    await getAndDisplayBoard(-1);
    if (state.ownColor == "w") updateMarkings(true, false);

    // Browser UI refresh
    await new Promise(resolve => setTimeout(resolve, 0));

    if (state.enemyColor == "w") {
        await makeEnemyMove();
    }
}

// Click function of the fields
export async function handlePieceClick(row, col) {
    if (state.fieldButtonsLocked) return;
    // Must be the latest board
    if (state.stateLocation != state.maxStateLocation) return;
    const fieldString = fieldToString(row, col);
    if (state.ownPieces[row][col]) {
        // Save first selection and highlight move destinations
        state.firstSelection = fieldString;
        state.destinations = await createMoveMap(row, col);
        updateMarkings(false, true);
    } else if (state.destinations[row][col]) {
        // Save destination selection and apply move
        state.secondSelection = fieldString;
        const move = moveStringFromSelection();
        
        await makeOwnMove(move);
        
        // Let enemy make a move
        if (!state.gameEnded) {
            // Browser UI refresh
            await new Promise(resolve => setTimeout(resolve, 0));
            // Lock untill enemy made the next move
            state.fieldButtonsLocked = true;
            await makeEnemyMove();
            state.fieldButtonsLocked = false;
        }
    } else {
        // Reset selections and mark own pieces waiting for selection
        resetSelections();
        updateMarkings(true, false);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gets board from API and updates UI
export async function getAndDisplayBoard(idx) {
    const game = await API.getBoard(idx, state.boardid, state.ownColor, state.ownToken, state.abortController.signal);
    processGameFromApi(game);
    updateBoardUI();
    state.winner = game.winner;
    if (!state.gameEnded && state.winner != "n") {
        await delay(200);
        await endGame();
    }
}

// Update board UI using previously gathered global data
function updateBoardUI() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const fieldElem = document.getElementById(`${row}${col}`);
            fieldElem.innerHTML = '';
            
            const pieceString = state.boardPieceStrings[row][col];
            if (pieceString != "") {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add("piece");
                pieceElement.classList.add(pieceString);
                fieldElem.appendChild(pieceElement);
            }

            const row_ = state.ownColor == 'w' ? row : 7-row;
            const col_ = state.ownColor == 'w' ? col : 7-col;
            if (state.stateLocation === state.maxStateLocation &&
            (row_ === state.latestMove[0][0] && col_ === state.latestMove[0][1] ||
            row_ === state.latestMove[1][0] && col_ === state.latestMove[1][1])) {
                const marking = document.createElement('div');
                marking.classList.add("latest-move-marking");
                fieldElem.appendChild(marking);
            }
        }
    }
}

// Converts API board state response 'game' to global data
function processGameFromApi(game) {
    const board = game.board;
    if (game.lastmove != "") state.latestMove = convertMove(game.lastmove);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            let color = "b";
            if (piece >= 97 && piece <= 127) color = "w";

            const pieceChar = String.fromCharCode(piece);  // Get the piece character from the array

            let pieceString = "";
            if (pieceChar != ' ') {
                pieceString = pieceCharToString[pieceChar];  // Get the piece name from the character
                if (!pieceString) {
                    console.log(`Couldn't find a matching class for "${pieceChar}".`)
                }
            }

            const to_row = state.ownColor == 'w' ? row : 7-row;
            const to_col = state.ownColor == 'w' ? col : 7-col;
            state.boardPieceStrings[to_row][to_col] = pieceString;
            state.ownPieces[to_row][to_col] = (pieceString != "" && color == state.ownColor);
        }
    }
}

// Sets markings. boolean 'ownPiecesOn' (un-)marks all own pieces, destinations marks all
// possible move destinations of the currently selected piece.  
export function updateMarkings(ownPiecesOn, destinationsOn) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const fieldElem = document.getElementById(`${row}${col}`);
            updateFieldMarking(fieldElem, false);
            
            if (state.ownPieces[row][col]) {
                updateFieldMarking(fieldElem, ownPiecesOn);
            } else if (state.destinations[row][col]) {
                updateFieldMarking(fieldElem, destinationsOn);
            }
        }
    }
}

// Sets a field marking on or off depending on the boolean 'on'
function updateFieldMarking(fieldElem, on) {
    const oldMark = fieldElem.querySelector('.marking');
    if (!on) {
        if (oldMark) oldMark.remove();
    } else {
        if (!oldMark) {
        const mark = document.createElement('div');
        mark.classList.add('marking');
        fieldElem.appendChild(mark);
        }
    }
}

// Clears selections and move suggestions
function resetSelections() {
    state.firstSelection = null;
    state.secondSelection = null;
    state.destinations = Array(8).fill().map(() => Array(8).fill(false));
}

// Generates an 8x8 boolean array marking possible move destinations
async function createMoveMap(row, col) {
    row = state.ownColor == 'w' ? row : 7-row;
    col = state.ownColor == 'w' ? col : 7-col;
    
    const possibleFields = Array(8).fill().map(() => Array(8).fill(false));

    const moves = await API.getMoves(state.boardid, state.ownColor, state.ownToken, row, col, state.abortController.signal);
    
    if (moves) {
        for (const move of moves) {
            let [row, col] = move.to;
            row = state.ownColor == 'w' ? row : 7-row;
            col = state.ownColor == 'w' ? col : 7-col;
            possibleFields[row][col] = true;
        }
    }

    return possibleFields;
}

// Ends game and displays a popup. Fields are unclickable and markings removed.
export async function endGame() {
    state.gameEnded = true;
    // Disable 'forfeit' button
    const forfeitButton = document.getElementById('forfeit-button');
    forfeitButton.classList.add('disabled');
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const fieldElem = document.getElementById(`${row}${col}`);
            fieldElem.style.pointerEvents = "none";
        }
    }
    updateMarkings(false, false);
    popups.displayEndScreenPopup();
}

// Applies own moves, then updates the internal bot state
async function makeOwnMove(move) {
    await API.makeMove(state.boardid, state.ownToken, state.ownColor, move, state.abortController.signal);
    state.stateLocation++;
    state.maxStateLocation++;
    await getAndDisplayBoard(-1);
    resetSelections();
    updateMarkings(false, false);

    const movePtr = state.bot.bot_string_to_move(move);
    state.bot.bot_make_move(movePtr, state.botBoardState);
}

// Lets the enemy generate and apply a move
async function makeEnemyMove() {
    if (!state.isBotExternal) {
        // Generate best move
        const bestMoveStr = state.bot.bot_compute_move(state.visionDepth, state.botBoardState);
        try {
            await API.makeMove(state.boardid, state.enemyToken, state.enemyColor, bestMoveStr, state.abortController.signal);
            // Update internal bot state
            const bestMovePtr = state.bot.bot_string_to_move(bestMoveStr);
            state.bot.bot_make_move(bestMovePtr, state.botBoardState);
        } catch (err) {
            if (err.name == 'AbortError') return;
            // Fail: Ask API to make a random move
            console.log("Bot failed to generate a valid move. Choosing a random one.");
            await API.makeRandomEnemyMove(state.boardid, state.enemyToken, state.enemyColor, state.abortController.signal);
            
            // Extract random move and update internal bot state
            const board = await API.getBoard(-1, state.boardid, state.enemyColor, state.enemyToken, state.abortController.signal);
            const latestMovePtr = state.bot.bot_string_to_move(board.lastmove);
            state.bot.bot_make_move(latestMovePtr, state.botBoardState);
        }
        state.stateLocation++;
        state.maxStateLocation++;
    } else {
        // Wait for the external bot to make its move. Resume once it's the player's turn.
        try {
            await API.waitForTurn(state.boardid, state.ownColor, state.password, state.abortController.signal);
        } catch (err) {
            // Other errors are being caught at a lower level already
            if (err.name === "AbortError") {
                return;
            }
        }
        state.stateLocation++;
        state.maxStateLocation++;
    }
    await getAndDisplayBoard(-1);
    resetSelections();
    updateMarkings(true, false);
}
