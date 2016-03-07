function checkBoardState(b) {
    if(-1 != b[5].indexOf(null)) return -1;
    for(var r=0; r<6; r++) {
        for(var c=0; c<7; c++) {
            if(c<4 &&           b[r][c] ==  b[r][c+1] ==    b[r][c+2] ==    b[r][c+3])      return b[r][c];
            if(r<3 &&           b[r][c] ==  b[r+1][c] ==    b[r+2][c] ==    b[r+3][c])      return b[r][c];
            if(c<4 && r<3 &&    b[r][c] ==  b[r+1][c+1] ==  b[r+1][c+2] ==  b[r+1][c+3])    return b[r][c];
            if(c<4 && r>2 &&    b[r][c] ==  b[r-1][c+1] ==  b[r-1][c+2] ==  b[r-1][c+3])    return b[r][c];
        }
    }
    return null;
}

function GameController(sockets, isRanked) {

    var turn = 0;

    var board = [];
    for(var i=0; i<6; i++) {
        board[i] = [];
        for(var j=0; j<7; j++) {
            board[i][j] = null;
        }
    }

    sockets.forEach(function(socket, socketIndex) {

        socket.emit('game', {
            id: socketIndex,
            opponent: sockets[1-socketIndex].username,
            turncolour: turn
        });

        var newMove = function(move) {

            if(turn == userNumber) {
                if(makeMove(move.column)) {
                    sendBoard();
                    result = checkBoardState(board);
                    if(result !== null) {
                        sendResult();    
                    }
                }    
            }

        };

        socket.on('newMove', newMove);

        var leave = function() {
            socket.removeListener('newmove', newMove);
        };
    });
}

module.exports = GameController;