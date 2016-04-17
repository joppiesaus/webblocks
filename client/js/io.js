socket = io();

socket.on( 'connect', function( data ) {
    console.info( 'connected' );

    // Remove "Connecting..." message
    var el = document.getElementById( 'connectingmsg' );
    if (el) {
        el.parentElement.removeChild( el );
    }

    socket.emit( 'requestOldPlayers', {} );
});

socket.on( 'updateVariable', function( data ) {
    game.updatePlayerVariable( data );
});

socket.on( 'updatePlayerPosition', function( data ) {
    game.updatePlayerPosition( data );
});

socket.on( 'createPlayer', function( data ) {
    game.createPlayer( data );
});

socket.on( 'createOtherPlayer', function( data ) {
    game.createOtherPlayer( data );
});

socket.on( 'removeOtherPlayer', function( data ) {
    game.removePlayer( data );
});
