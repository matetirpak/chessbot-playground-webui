/*
Global datastructures and functions for variable conversion are defined here.
*/

import { state } from './data.js';


export const pieceCharToString = {
  'r': "whiterook",    // 'r' -> white rook
  'k': "whiteknight",  // 'k' -> white knight
  'b': "whitebishop",  // 'b' -> white bishop
  'q': "whitequeen",   // 'q' -> white queen
  'x': "whiteking",    // 'x' -> white king
  'p': "whitepawn",    // 'p' -> white pawn
  'R': "blackrook",    // 'R' -> black rook
  'K': "blackknight",  // 'K' -> black knight
  'B': "blackbishop",  // 'B' -> black bishop
  'Q': "blackqueen",   // 'Q' -> black queen
  'X': "blackking",    // 'X' -> black king
  'P': "blackpawn",    // 'P' -> black pawn
};

export const pieceStringToChar = {
  "whiterook": 'r',    // 'white rook' -> 'r'
  "whiteknight": 'k',  // 'white knight' -> 'k'
  "whitebishop": 'b',  // 'white bishop' -> 'b'
  "whitequeen": 'q',   // 'white queen' -> 'q'
  "whiteking": 'x',    // 'white king' -> 'x'
  "whitepawn": 'p',    // 'white pawn' -> 'p'
  "blackrook": 'R',    // 'black rook' -> 'R'
  "blackknight": 'K',  // 'black knight' -> 'K'
  "blackbishop": 'B',  // 'black bishop' -> 'B'
  "blackqueen": 'Q',   // 'black queen' -> 'Q'
  "blackking": 'X',    // 'black king' -> 'X'
  "blackpawn": 'P',    // 'black pawn' -> 'P'
};

// (0,0) -> "a8" (white) or "h1" (black)
export function fieldToString(row, col) {
    row = state.ownColor == 'w' ? row : 7-row;
    col = state.ownColor == 'w' ? col : 7-col;
    const rowChar = 8 - row;
    const colChar = String.fromCharCode('a'.charCodeAt(0) + col);
    return colChar + rowChar;
}

// Generate move like "e2 e4" from selection
export function moveStringFromSelection() {
    return state.firstSelection + " " + state.secondSelection;
}

// Convert chess notation like "e2 e4" to array [[row, col], [row, col]]
export function convertMove(moveStr) {
    const letterToIndex = (letter) => letter.charCodeAt(0) - 'a'.charCodeAt(0); // Converts column letter to index
    const numberToIndex = (number) => 8 - parseInt(number); // Converts row number to index (8 - row)

    // Split the move string into start and end positions
    const [start, end] = moveStr.split(' ');
    // Convert start position (e.g., "e2")
    const startCol = letterToIndex(start[0]);
    const startRow = numberToIndex(start[1]);
    
    // Convert end position (e.g., "e4")
    const endCol = letterToIndex(end[0]);
    const endRow = numberToIndex(end[1]);

    // Return the result as a 2D array [[row1, col1], [row2, col2]]
    return [
        [startRow, startCol],
        [endRow, endCol]
    ];
}