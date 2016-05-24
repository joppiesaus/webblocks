var express = require( 'express' );
var app = express();
var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var world = require( './server/server' );

app.use (express.static( 'client' ) );

world.generateLevel();

io.on( 'connection', function( socket ) {

    var id = socket.id;

    console.log( 'user ' + id + ' connected' );

    var player = world.addPlayer( id );

    socket.emit( 'createPlayer', player );

    socket.broadcast.emit( 'createOtherPlayer', player );

    socket.on( 'requestOldPlayers', function() {
        for ( var key in world.players ) {
            if ( key !== id ) {
                socket.emit( 'createOtherPlayer', world.players[key] );
            }
        }
    });

    socket.on( 'message', function( data ) {
        var message = player.name + ': ' + data;
        console.log( message );
        socket.broadcast.emit( 'message', message );
    });

    socket.on( 'command', function( data ) {
        socket.emit( 'message', 'No!' );
    });

    socket.on( 'blockAdd', function( data ) {
        world.level.blocks[ data.position.x ][ data.position.y ][ data.position.z ] = data;
        socket.broadcast.emit( 'blockAdd', data );
    });

    socket.on( 'blockRemove', function( data ) {
        world.level.blocks[ data.position.x ][ data.position.y ][ data.position.z ] = undefined;
        socket.broadcast.emit( 'blockRemove', data );
    });

    socket.on( 'requestLevel', function() {
        socket.emit( 'level', world.level );
    });

    socket.on( 'updateVariable', function( data ) {
        world.updatePlayerVariable( data.id, data.variable, data.val );
        socket.broadcast.emit( 'updateVariable', data );
    });


    socket.on( 'updatePlayerPosition', function( data ) {
        world.updatePlayerVariable( data.id, 'position', data.val );
        socket.broadcast.emit( 'updatePlayerPosition', data );
    });

    socket.on( 'updatePlayerVector3', function( data ) {
        world.updatePlayerVariable( data.id, data.variable, data.val );
        socket.broadcast.emit( 'updatePlayerVector3', data );
    });

    socket.on( 'disconnect', function() {
        console.log( 'user ' + id + ' disconnected' );
        io.emit( 'removeOtherPlayer', id );
        world.removePlayerById( id );
    });

});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

http.listen( port, function() {
    console.log( 'Listening on localhost:' + port );
});
