socket = io();

socket.on( 'connect', function( data ) {
    console.info( 'connected' );

    // Remove "Connecting..." message
    document.getElementById( 'msg' ).textContent = "Click to play";

    socket.emit( 'requestOldPlayers', {} );
});

socket.on( 'disconnect', function( data ) {
    document.getElementById( 'msg' ).textContent = "Reconnecting...";
});

socket.on( 'updateVariable', function( data ) {
    game.updatePlayerVariable( data );
});

socket.on( 'updatePlayerVector3', function( data ) {
    game.updatePlayerVector3( data );
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
