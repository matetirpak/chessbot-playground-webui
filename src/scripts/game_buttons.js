import * as API from './api_calls.js';
import { state } from './data.js';
import { closeEndScreenPopup } from './game_popups.js';
import { endGame, getAndDisplayBoard, updateMarkings } from './game_loop.js';


export function initButtons() {
    const controller = new AbortController();
    state.abortController = controller;

    document.getElementById('ok-button').addEventListener('click', closeEndScreenPopup);
    document.getElementById('leave-button').addEventListener('click', quitGame);

    document.querySelectorAll('.home-button').forEach(button => {
        button.addEventListener('click', quitGame);
    });

    document.getElementById("copy-password-button").addEventListener("click", () => {
        const fullText = document.getElementById("password-text").textContent;
        const password = fullText.split(": ")[1];
        navigator.clipboard.writeText(password).catch(err => {
            console.error("Copy failed:", err);
        });
    });
    
    document.getElementById("forfeit-button").addEventListener("click", async () => {
        await API.forfeit(state.boardid, state.ownToken, state.ownColor, state.abortController.signal);
        await getAndDisplayBoard(-1);
        endGame();
    });

    document.getElementById("move->").addEventListener("click", async () => {
        if (state.stateLocation == state.maxStateLocation) return
        state.stateLocation++;
        
        await getAndDisplayBoard(state.stateLocation);

        if (state.stateLocation == state.maxStateLocation && !state.gameEnded) updateMarkings(true, false);
        else updateMarkings(false, false);
    });

    document.getElementById("move->>").addEventListener("click", async () => {
        state.stateLocation = state.maxStateLocation;
        
        await getAndDisplayBoard(state.stateLocation);

        if (!state.gameEnded) updateMarkings(true, false);
    });

    document.getElementById("move<-").addEventListener("click", async () => {
        if (state.stateLocation == 0) return
        state.stateLocation--;

        await getAndDisplayBoard(state.stateLocation);

        updateMarkings(false, false);
    });

    document.getElementById("move<<-").addEventListener("click", async () => {
        if (state.stateLocation == 0) return 
        state.stateLocation = 0
        
        await getAndDisplayBoard(state.stateLocation);

        updateMarkings(false, false);
    });
}

// Moves back to game selection
async function quitGame() {
    await API.deleteSession(state.boardid, state.password);
    state.abortController.abort();
    window.location.href = "/";
}