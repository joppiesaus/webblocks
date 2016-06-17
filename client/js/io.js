socket = io();

socket.on( 'connect', function( data ) {
    console.info( 'connected' );

    // Remove "Connecting..." message
    document.getElementById( 'msg' ).textContent = 'Click to play';

    socket.emit( 'requestOldPlayers', {} );
    socket.emit( 'requestLevel', {} );
});

socket.on( 'disconnect', function( data ) {
    document.getElementById( 'msg' ).textContent = 'Reconnecting...';
});

socket.on( 'message', function( data ) {
    console.log( data );
});

socket.on( 'level', function( data ) {
    game.importLevel( data );
});

socket.on( 'blockAdd', function( data ) {
    game.world.level.addBlockFromServer( data );
});

socket.on( 'blockRemove', function( data ) {
    game.world.level.removeBlockFromServer( data );
});

socket.on( 'updateVariable', function( data ) {
    game.updatePlayerVariable( data );
});

socket.on( 'updatePlayerVector3', function( data ) {
    game.updatePlayerVector3( data );
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
