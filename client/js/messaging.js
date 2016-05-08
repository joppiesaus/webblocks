var sendMessage = function( data ) {
    socket.emit( 'message', data );
};

var sendCommand = function( data ) {
    socket.emit( 'command', data );
};
