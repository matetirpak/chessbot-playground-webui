let apiUrl = "";
export function setApiUrl(url) {
    apiUrl = url;
}

async function apiRequest(path, method, body = null, token = null, signal) {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }

        const response = await fetch(apiUrl + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
            signal,
        });

        const contentType = response.headers.get("Content-Type");
        const text = await response.text();
        const isJson = contentType && contentType.includes("application/json");

        let data;
        if (isJson && text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn("Failed to parse JSON:", text);
                data = { error: "Invalid JSON response" };
            }
        } else {
            data = { error: text || "Empty response" };
        }

        if (!response.ok) {
            throw new Error(data.error || `HTTP error ${response.status}`);
        }

        return data;
    } catch (err) {
        if (err.name != 'AbortError') console.error(`${method} ${path} Error:`, err.message || err);
        throw err;
    }
}

// Create new game
export async function createSession(name, signal = null) {
    return await apiRequest("sessions", "POST", { name }, signal);
}

// Register to a session/game as a player
export async function registerSession(boardid, password, color, signal = null) {
    return await apiRequest("sessions", "PUT", {
        boardid,
        color,
    }, password, signal);
}

// Get chess related game information
export async function getBoard(moveidx, boardid, color, token, signal = null) {
    const params = new URLSearchParams({
        moveidx,
        boardid,
        color,
        reqtype: "state",
    });
    return await apiRequest("game?" + params.toString(), "GET", null, token, signal);
}

// Returns all possible moves of a given piece
export async function getMoves(boardid, color, token, row, col, signal = null) {
    const params = new URLSearchParams({
        boardid,
        color,
        row,
        col,
        reqtype: "moves",
    });
    return await apiRequest("game?" + params.toString(), "GET", null, token, signal);
}

export async function makeMove(boardid, token, color, move, signal = null) {
    return await apiRequest("game", "PUT", {
        boardid,
        color,
        move,
        reqtype: "move",
    }, token, signal);
}

export async function makeRandomEnemyMove(boardid, token, color, signal = null) {
    return await apiRequest("game", "PUT", {
        boardid,
        color,
        reqtype: "randommove",
    }, token, signal);
}

export async function forfeit(boardid, token, color, signal = null) {
    return await apiRequest("game", "PUT", {
        boardid,
        color,
        reqtype: "forfeit",
    }, token, signal);
}

// Server holds the request untill the players turn has come, then responds
export async function waitForTurn(boardid, color, token, signal = null) {
    const params = new URLSearchParams({
        boardid,
        color,
        reqtype: "turn",
    });
    return await apiRequest("game?" + params.toString(), "GET", null, token, signal);
}

export async function deleteSession(boardid, token, signal = null) {
    return await apiRequest("sessions", "DELETE", {
        boardid,
    }, token, signal);
}

// Returns all sessions known by the API
export async function getSessions(signal = null) {
    return await apiRequest("sessions", "GET", null, null, signal);
}
