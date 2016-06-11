
var Level = function() {

    this.chunks = [];

};

Level.prototype.importData = function( data ) {

    this.size = new THREE.Vector3( data.size.x, data.size.y, data.size.z );
    this.chunkSize = this.size.clone().divideScalar( constants.Chunksize ).floor();

    var blocks = [ ];

    for ( var x = 0; x < data.blocks.length; x++ ) {

        var xArr = [ ];

        for ( var y = 0; y < data.blocks[ x ].length; y++ ) {

            var yArr = [ ];

            for ( var z = 0; z < data.blocks[ x ][ y ].length; z++ ) {

                var block = new Block();

                if ( data.blocks[ x ][ y ][ z ] ) {

                    block.importData( data.blocks[ x ][ y ][ z ] );

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

    for ( var xc = 0; xc < this.chunkSize.x; xc++ ) {

        var xcArr = [ ];

        for ( var yc = 0; yc < this.chunkSize.y; yc++ ) {

            var ycArr = [ ];

            for ( var zc = 0; zc < this.chunkSize.z; zc++ ) {

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

                ycArr.push( new Chunk( cblocks, new THREE.Vector3( xc, yc, zc ) ) );

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

    this.addBlockCore( block );
    socket.emit( 'blockAdd', block.exportData() );

};

Level.prototype.addBlockFromServer = function( data ) {

    var block = new Block();
    block.importData( data );

    this.addBlockCore( block );

};

Level.prototype.addBlockCore = function( block ) {

    var chunkPosition = block.position.clone().divideScalar( constants.Chunksize ).floor();
    var innerPosition = new THREE.Vector3(
            block.position.x % constants.Chunksize,
            block.position.y % constants.Chunksize,
            block.position.z % constants.Chunksize
    );

    var chunk = this.chunks
        [ chunkPosition.x ]
        [ chunkPosition.y ]
        [ chunkPosition.z ];

    chunk.blocks
        [ innerPosition.x ]
        [ innerPosition.y ]
        [ innerPosition.z ]
        = block;

    chunk.build();
    this.checkBoundingChunks( chunkPosition, innerPosition );

};

// Checks for bounding chunks that need to be updated in case of a block/mesh change aligning it
Level.prototype.checkBoundingChunks = function( chunkPosition, innerPosition ) {

    if ( innerPosition.x === 0 && chunkPosition.x > 0 ) {
        this.chunks
            [ chunkPosition.x - 1 ]
            [ chunkPosition.y ]
            [ chunkPosition.z ]
            .build();
    } else if ( innerPosition.x === constants.Chunksize - 1 && chunkPosition.x < this.chunkSize.x - 1 ) {
        this.chunks
            [ chunkPosition.x + 1 ]
            [ chunkPosition.y ]
            [ chunkPosition.z ]
            .build();
    }

    if ( innerPosition.y === 0 && chunkPosition.y > 0 ) {
        this.chunks
            [ chunkPosition.x ]
            [ chunkPosition.y - 1 ]
            [ chunkPosition.z ]
            .build();
    } else if ( innerPosition.y === constants.Chunksize - 1 && chunkPosition.y < this.chunkSize.y - 1 ) {
        this.chunks
            [ chunkPosition.x ]
            [ chunkPosition.y + 1]
            [ chunkPosition.z ]
            .build();
    }

    if ( innerPosition.z === 0 && chunkPosition.z > 0 ) {
        this.chunks
            [ chunkPosition.x ]
            [ chunkPosition.y ]
            [ chunkPosition.z - 1]
            .build();
    } else if ( innerPosition.z === constants.Chunksize - 1 && chunkPosition.z < this.chunkSize.z - 1 ) {
        this.chunks
            [ chunkPosition.x ]
            [ chunkPosition.y ]
            [ chunkPosition.z + 1 ]
            .build();
    }

};

Level.prototype.removeBlockAtPosition = function( position ) {

    this.removeBlockAtPositionCore( position );

    socket.emit( 'blockRemove', { position: position } );

};

Level.prototype.removeBlockAtPositionCore = function( position ) {

    var chunkPosition = position.clone().divideScalar( constants.Chunksize ).floor();
    var innerPosition = new THREE.Vector3(
            position.x % constants.Chunksize,
            position.y % constants.Chunksize,
            position.z % constants.Chunksize
    );

    var chunk = this.chunks
        [ chunkPosition.x ]
        [ chunkPosition.y ]
        [ chunkPosition.z ];

    var block = chunk.blocks
        [ innerPosition.x ]
        [ innerPosition.y ]
        [ innerPosition.z ];

    block.remove();

    chunk.build();
    this.checkBoundingChunks( chunkPosition, innerPosition );

};

Level.prototype.removeBlockFromServer = function( data ) {

    this.removeBlockAtPositionCore( new THREE.Vector3(
        data.position.x,
        data.position.y,
        data.position.z
    ) );

};

Level.prototype.getBlock = function( position ) {

    var chunkPosition = position.clone().divideScalar( constants.Chunksize ).floor();

    var chunk = this.chunks
        [ chunkPosition.x ]
        [ chunkPosition.y ]
        [ chunkPosition.z ];

    return chunk.blocks
        [ position.x % constants.Chunksize ]
        [ position.y % constants.Chunksize ]
        [ position.z % constants.Chunksize ];

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
