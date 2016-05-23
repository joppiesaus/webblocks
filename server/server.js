var THREE = require( 'three' );

var players = { };
var playerCount = 1;

var Player = function( id ) {

    this.id = id;
    this.name = 'Player ' + playerCount;
    this.position = exports.level.spawnpoint.clone();
    this.color = Math.random() * 0xffffff;

    playerCount++;
};

exports.addPlayer = function( id ) {

    var p = new Player( id );
    players[ id ] = p;
    return p;

};

exports.updatePlayerData = function( data ) {
    return players[ data.id ] = data;
};

exports.updatePlayerVariable = function( id, variable, value ) {
    players[ id ][ variable ] = value;
};

exports.removePlayerById = function( id ) {
    delete players[ id ];
};

exports.removePlayer = function( player ) {
    delete players[ player.id ];
};

exports.generateLevel = function() {

    var SIZE = 64;

    this.level = { blocks: [ ], size: { x: SIZE, y: SIZE, z: SIZE } };

    // TODO: Remove position information
    var hSize = SIZE / 2;
    for ( var x = 0; x < SIZE; x++ ) {
        var yArr = [ ];
        var x2 = x * x;
        for ( var y = 0; y < SIZE; y++ ) {
            var zArr = [ ];
            var y2 = y * y;
            for ( var z = 0; z < SIZE; z++ ) {

                var mag = Math.round( Math.sqrt( x2 + y2 + z * z ) );

                if ( mag < SIZE ) {
                    var id = x > hSize ? 2 : 3;

                    zArr.push( {
                        //id: Math.floor( Math.random() * 3 ) + 1,
                        //id: 1,
                        id: id,
                        position: { x: x, y: y, z: z }
                    } );
                } else {
                    zArr.push( undefined );
                }

            }
            yArr.push( zArr );
        }
        this.level.blocks.push( yArr );
    }

    this.level.spawnpoint = new THREE.Vector3( SIZE, SIZE, SIZE );
};

exports.players = players;
