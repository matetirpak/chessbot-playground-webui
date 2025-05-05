/*
Used to initialize game.html
*/

import { setApiUrl } from './api_calls.js';
import { state } from './data.js';
import { initButtons } from './game_buttons.js';
import { initPopups } from './game_popups.js';
import { handlePieceClick, initGame } from './game_loop.js';

// Determine game settings from URL
const urlParams = new URLSearchParams(window.location.search);
const color = urlParams.get("color");
const isBotExternal = urlParams.get("isbotexternal") === "true";
const difficulty = urlParams.get("difficulty");
state.ownColor = (color === 'r') ? (Math.random() < 0.5 ? 'w' : 'b') : (color === 'w' ? 'w' : 'b');
state.enemyColor = state.ownColor === 'w' ? 'b' : 'w';
state.isBotExternal = isBotExternal;
state.visionDepth = difficulty * 2;

// Display github link
const url = "https://github.com/matetirpak/chessbot-playground-webui";
const link = document.getElementById("github-link");
link.href = url;
link.textContent = url;

// Set up board UI
function initChessboard() {
    const boardContainer = document.getElementById('chessboard');
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const fieldElement = document.createElement('div');
            fieldElement.classList.add('field');
            if ((row + col) % 2 === 0) {
                fieldElement.classList.add('bright');
            } else {
                fieldElement.classList.add('dark');
            }
            fieldElement.id = `${row}${col}`;
            fieldElement.addEventListener('click', () => handlePieceClick(row, col));
            boardContainer.appendChild(fieldElement);
        }
    }

    // If the player is black, reverse the order of ranks and files
    if (state.ownColor === "b") {
        const ranks = document.querySelector('#ranks');
        const ranksCoords = ranks.querySelectorAll('coord');
        const files = document.querySelector('#files');
        const filesCoords = files.querySelectorAll('coord');
        const coordArrayRanks = Array.from(ranksCoords);
        const coordArrayFiles = Array.from(filesCoords);

        coordArrayRanks.reverse();
        coordArrayFiles.reverse();

        // Delete and reconstruct
        ranks.innerHTML = '';
        coordArrayRanks.forEach(coord => {
            ranks.appendChild(coord);
        });
        files.innerHTML = '';
        coordArrayFiles.forEach(coord => {
            files.appendChild(coord);
        });
    }
}

// Load bot
const botReady = new Promise((resolve, reject) => {
    if (typeof Module !== 'undefined') {
        Module.onRuntimeInitialized = () => {
            state.bot = {
                bot_create_board: Module.cwrap('bot_create_board', 'number', []),
                bot_compute_move: Module.cwrap('bot_compute_move', 'string', ['number', 'number']),
                bot_make_move: Module.cwrap('bot_make_move', null, ['number', 'number']),
                bot_string_to_move: Module.cwrap('bot_string_to_move', 'number', ['string']),
                bot_print_board: Module.cwrap('bot_print_board', null, ['number', 'number']),
            };
            resolve();
        };
    } else {
        reject("Module is not defined");
    }
});

// Start program
document.addEventListener('DOMContentLoaded', async function () {
    setApiUrl("http://localhost:8080/chessserver/v1/");
    initChessboard();
    initButtons();
    initPopups();
    try {
        await botReady;
        initGame();
    } catch (err) {
        console.error("Bot failed to load:", err);
    }
});