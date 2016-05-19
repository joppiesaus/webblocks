
var Level = function() {

    this.chunks = [];

};

Level.prototype.importData = function( data ) {

    this.size = new THREE.Vector3( data.size.x, data.size.y, data.size.z );

    var blocks = [ ];

    for ( var x = 0; x < data.blocks.length; x++ ) {

        var xArr = [ ];

        for ( var y = 0; y < data.blocks[ x ].length; y++ ) {

            var yArr = [ ];

            for ( var z = 0; z < data.blocks[ x ][ y ].length; z++ ) {

                var block = new Block();

                if ( data.blocks[ x ][ y ][ z ] ) {

                    block.importData( data.blocks[ x ][ y ][ z ] );
                    block.setup();

                } else {

                    // if undefined then setup air
                    block.importData( { id: 0, position: { x: x, y: y, z: z } } );

                }

                yArr.push( block );

            }

            xArr.push( yArr );

        }

        blocks.push( xArr );

    }

    for ( var xc = 0; xc < this.size.x / constants.Chunksize; xc++ ) {

        var xcArr = [ ];

        for ( var yc = 0; yc < this.size.y / constants.Chunksize; yc++ ) {

            var ycArr = [ ];

            for ( var zc = 0; zc < this.size.z / constants.Chunksize; zc++ ) {

                var cblocks = [ ];

                for ( var x = xc * constants.Chunksize; x < ( xc + 1 ) * constants.Chunksize; x++ ) {

                    var yArr = [ ];

                    for ( var y = yc * constants.Chunksize; y < ( yc + 1 ) * constants.Chunksize; y++ ) {

                        yArr.push(
                            blocks[ x ][ y ]
                            .slice( zc * constants.Chunksize, ( zc + 1 ) * constants.Chunksize )
                        );

                    }

                    cblocks.push( yArr );

                }

                ycArr.push( new Chunk( cblocks ) );

            }

            xcArr.push( ycArr );

        }

        this.chunks.push( xcArr );

    }

    this.forEachChunk( chunk => {
        chunk.build();
    });

};

Level.prototype.exportData = function() {

};


Level.prototype.isOutOfBounds = function( position ) {

    return position.x < 0 || position.x >= this.size.x ||
        position.y < 0 || position.y >= this.size.y ||
        position.z < 0 || position.z >= this.size.z;

};

Level.prototype.addBlock = function( block ) {

    var chunk = this.chunks
        [ Math.floor( block.position.x / constants.Chunksize ) ]
        [ Math.floor( block.position.y / constants.Chunksize ) ]
        [ Math.floor( block.position.z / constants.Chunksize ) ];

    block.setup();

    chunk.blocks
        [ block.position.x % constants.Chunksize ]
        [ block.position.y % constants.Chunksize ]
        [ block.position.z % constants.Chunksize ]
        = block;

    chunk.build();

    socket.emit( 'blockAdd', block.exportData() );

};

Level.prototype.removeBlockAtPosition = function( position ) {

    // TODO: Add chunk property to block for easy removing/adding?
    var chunk = this.chunks
        [ Math.floor( position.x / constants.Chunksize ) ]
        [ Math.floor( position.y / constants.Chunksize ) ]
        [ Math.floor( position.z / constants.Chunksize ) ];

    chunk.blocks
        [ position.x % constants.Chunksize ]
        [ position.y % constants.Chunksize ]
        [ position.z % constants.Chunksize ]
        .remove();

    chunk.build();

};

Level.prototype.removeBlockFromServer = function( data ) {

    var chunk = this.chunks
        [ Math.floor( data.position.x / constants.Chunksize ) ]
        [ Math.floor( data.position.y / constants.Chunksize ) ]
        [ Math.floor( data.position.z / constants.Chunksize ) ];

    chunk.blocks
        [ data.position.x % constants.Chunksize ]
        [ data.position.y % constants.Chunksize ]
        [ data.position.z % constants.Chunksize ]
        .removeFromServer();

    chunk.build();

};

Level.prototype.addBlockFromServer = function( data ) {

    var block = new Block();
    block.importData( data );
    block.setup();

    var chunk = this.chunks
        [ Math.floor( block.position.x / constants.Chunksize ) ]
        [ Math.floor( block.position.y / constants.Chunksize ) ]
        [ Math.floor( block.position.z / constants.Chunksize ) ];

    chunk.blocks
        [ block.position.x % constants.Chunksize ]
        [ block.position.y % constants.Chunksize ]
        [ block.position.z % constants.Chunksize ]
        = block;

    chunk.build();

};

Level.prototype.getBlock = function( position ) {

    return
        this.chunks
        [ Math.floor( position.x / constants.Chunksize ) ]
        [ Math.floor( position.y / constants.Chunksize ) ]
        [ Math.floor( position.z / constants.Chunksize ) ]
        .blocks
        [ position.x % constants.Chunksize ]
        [ position.y % constants.Chunksize ]
        [ position.z % constants.Chunksize ]
    ;

};

Level.prototype.forEachChunk = function( func ) {

    for ( var x = 0; x < this.chunks.length; x++ ) {
        for ( var y = 0; y < this.chunks[ x ].length; y++ ) {
            for ( var z = 0; z < this.chunks[ x ][ y ].length; z++ ) {
                func( this.chunks[ x ][ y ][ z ] );
            }
        }
    }

};
