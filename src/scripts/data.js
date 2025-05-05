export const state = {
    // Bot data
    visionDepth: null,
    isBotExternal: false,
    botBoardState: null,

    // API data
    abortController: null,
    ownColor: null,
    enemyColor: null,
    boardid: null,
    password: null,
    ownToken: null,
    enemyToken: null,

    // Game data
    stateLocation: 0,
    maxStateLocation: 0,
    gameEnded: false,
    fieldButtonsLocked: false,

    // Saves the conversion of API board pieces to html class strings
    boardPieceStrings: Array(8).fill().map(() => Array(8).fill(null)),
   
    // Processing current move
    ownPieces: Array(8).fill().map(() => Array(8).fill(false)),
    destinations: Array(8).fill().map(() => Array(8).fill(false)),
    firstSelection: null,
    secondSelection: null,
    
    // Gray highlight of latest move
    latestMove: Array(2).fill().map(() => Array(2).fill(-1)), // [[row,col],[row][col]]
};
