import { state } from './data.js';


export function initPopups() {
    const botPopupTitle = document.getElementById('bot-popup-title');
    botPopupTitle.textContent = "Connect an external bot with the following parameters:";
}


export function displayEndScreenPopup() {
    const message = document.getElementById("game-ended-popup-message");
    
    message.textContent = `Game ended! You ${state.winner === state.ownColor ? "won" : "lost"}.`;

    const popup = document.getElementById("game-ended-popup");
    popup.style.display = "flex";
}

export function closeEndScreenPopup() {
    const popup = document.getElementById('game-ended-popup');
    popup.style.display = 'none';
}


export function displayBotRegistrationPopup() {
    const boardid = document.getElementById("boardid-text");
    const color = document.getElementById("gamecolor-text");
    const password = document.getElementById("password-text");
    
    boardid.textContent = `Board ID: ${state.boardid}`;
    color.textContent = `Color: ${state.enemyColor}`;
    password.textContent = `Password: ${state.password}`;

    const popup = document.getElementById("bot-registration-popup");
    popup.style.display = "flex";
}

export function closeBotRegistrationPopup() {
    const popup = document.getElementById('bot-registration-popup');
    popup.style.display = 'none';
}

