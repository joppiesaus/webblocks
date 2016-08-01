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

exports.minifiedLevel = function() {

    var level = { blocks: [ ], size: this.level.size, spawnpoint: this.level.spawnpoint };

    for ( var x = 0; x < this.level.size.x; x++ ) {

        for ( var y = 0; y < this.level.size.y; y++ ) {

            for ( var z = 0; z < this.level.size.z; z++ ) {

                level.blocks.push(
                    !this.level.blocks[ x ][ y ][ z ] ? 0 : this.level.blocks[ x ][ y ][ z ].id
                );

            }

        }

    }

    return level;

};

exports.loadMinifiedLevel = function( data ) {

    this.level = {
        blocks: [ ],
        size: data.size,
        spawnpoint: new THREE.Vector3(
            data.spawnpoint.x,
            data.spawnpoint.y,
            data.spawnpoint.z
        ),
    };

    var i = 0;

    for ( var x = 0; x < this.level.size.x; x++ ) {

        var yArr = [ ];

        for ( var y = 0; y < this.level.size.y; y++ ) {

            var zArr = [ ];

            for ( var z = 0; z < this.level.size.z; z++ ) {

                var id = data.blocks[ i++ ];

                if ( !id ) {

                    zArr.push( undefined );

                } else {

                    zArr.push( {
                        id: id,
                        position: { x: x, y: y, z: z }
                    } )

                }

            }

            yArr.push( zArr );

        }

        this.level.blocks.push( yArr );

    }

};

exports.generateLevel = function() {

    var SIZE = 64;

    this.level = { blocks: [ ], size: { x: SIZE, y: SIZE, z: SIZE } };

    var id = Math.floor( Math.random() * 3 ) + 1;

    for ( var x = 0; x < SIZE; x++ ) {
        var yArr = [ ];
        for ( var y = 0; y < SIZE; y++ ) {
            var zArr = [ ];
            for ( var z = 0; z < SIZE; z++ ) {

                if ( y < x / ( SIZE / 8 ) || y === 0 ) {
                    zArr.push( {
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

    // TODO: Remove position information
    /*var hSize = SIZE / 2;
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
    }*/

    this.level.spawnpoint = new THREE.Vector3( SIZE - 1, SIZE - 1, SIZE - 1 );
};

exports.players = players;
