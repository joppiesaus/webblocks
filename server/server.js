var THREE = require( 'three' );

var players = { };
var playerCount = 1;

var Player = function( id ) {

    this.id = id;
    this.name = 'Player ' + playerCount;
    this.position = new THREE.Vector3(
        Math.random() * 2.0,
        1,
        Math.random() * 2.0
    );
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
    var level = { blocks: [ ] };

    var SIZE = 16;

    for ( var x = 0; x < SIZE; x++ ) {
        var yArr = [ ];
        for ( var y = 0; y < SIZE; y++ ) {
            var zArr = [ ];
            for ( var z = 0; z < SIZE; z++ ) {
                if ( y === 0 ) {
                    zArr.push( {
                        id: Math.floor( Math.random() * 2 ) + 1,
                        position: { x: x, y: y, z: z }
                    } );
                } else {
                    zArr.push( undefined );
                }
            }
            yArr.push( zArr );
        }
        level.blocks.push( yArr );
    }

    return level;
};

exports.players = players;
