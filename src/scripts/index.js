/*
Used to initialize index.html
*/

document.addEventListener("DOMContentLoaded", function () {


    const link = document.getElementById("github-link");
    const slider = document.getElementById("difficulty");
    const output = document.getElementById("difficulty-value");
    const checkbox = document.getElementById("externalBotCheckbox");

    const url = "https://github.com/matetirpak/chessbot-playground-webui";
    link.href = url;
    link.textContent = url;

    // Update displayed difficulty value
    slider.addEventListener("input", function () {
        output.textContent = slider.value;
    });

    // Disable/enable slider when checkbox changes
    checkbox.addEventListener("change", function () {
        slider.disabled = checkbox.checked;
    });

    let color;
    // Helper to build the URL with color and bot setting
    function redirectToGame() {
        const isBotExternal = checkbox.checked;
        window.location.href = `/game.html?isbotexternal=${isBotExternal}&difficulty=${slider.value}&color=${color}`;
    }

    // Redirect buttons
    document.getElementById("random").addEventListener("click", function () {
        color = "r";
        redirectToGame();
    });
    document.getElementById("black").addEventListener("click", function () {
        color = "b";
        redirectToGame();
    });
    document.getElementById("white").addEventListener("click", function () {
        color = "w";
        redirectToGame();
    });
});
