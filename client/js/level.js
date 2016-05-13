
var Level = function() {

    this.blocks = [];
    this.chunks = [];

};

Level.prototype.mergeBlocks = function( blocks ) {

    var combined = new THREE.Geometry();

    for ( var i = 0; i < blocks.length; i++ ) {

        // TODO: Delete block meshes, replace with matrix offsets
        // TODO: Just display the faces that are visible
        blocks[ i ].mesh.updateMatrix();
        combined.merge(
            blocks[ i ].mesh.geometry,
            blocks[ i ].mesh.matrix
        );

    }

    return combined;

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

                    blocks.push( block );

                } else {

                    // if undefined then setup air
                    block.importData( { id: 0, position: { x: x, y: y, z: z } } );

                }

                yArr.push( block );

            }

            xArr.push( yArr );

        }

        this.blocks.push( xArr );

    }

    for ( var xc = 0; xc < this.size.x / constants.Chunksize; xc++ ) {

        var xcArr = [ ];

        for ( var yc = 0; yc < this.size.y / constants.Chunksize; yc++ ) {

            var ycArr = [ ];

            for ( var zc = 0; zc < this.size.z / constants.Chunksize; zc++ ) {

                // TODO: Pick all blocks for that chunk, push them to the chunk

                var cblocks = [ ];

                for ( var x = xc * constants.Chunksize; x < ( xc + 1 ) * constants.Chunksize; x++ ) {

                    var yArr = [ ];

                    for ( var y = yc * constants.Chunksize; y < ( yc + 1 ) * constants.Chunksize; y++ ) {

                        yArr.push(
                            this.blocks[ x ][ y ]
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

    console.log( this.chunks );

    this.forEachChunk( chunk => {
        chunk.build();
    });


    /*var geometry = this.mergeBlocks( blocks );

    var mesh = new THREE.Mesh( geometry, blockdata.ChunkMaterial );

    scene.add( mesh );*/

};

Level.prototype.exportData = function() {

};


Level.prototype.isOutOfBounds = function( position ) {

    return position.x < 0 || position.x >= this.size.x ||
        position.y < 0 || position.y >= this.size.y ||
        position.z < 0 || position.y >= this.size.z;

};

Level.prototype.addBlock = function( block, position ) {

    if ( position ) block.position.copy( position );

    this.blocks[ block.position.x ][ block.position.y ][ block.position.z ] = block;
    block.setup();
    socket.emit( 'blockAdd', block.exportData() );

};

Level.prototype.removeBlockAtPosition = function( position ) {

    this.blocks[ position.x ][ position.y ][ position.z ].remove();

};

Level.prototype.removeBlockFromServer = function( data ) {

    this.blocks[ data.position.x ][ data.position.y ][ data.position.z ].removeFromServer();

};

Level.prototype.addBlockFromServer = function( data ) {

    var block = new Block();
    block.importData( data );
    block.setup();
    this.blocks[ block.position.x ][ block.position.y ][ block.position.z ] = block;

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

Level.prototype.forEachBlock = function( func ) {

    for ( var x = 0; x < this.blocks.length; x++ ) {
        for ( var y = 0; y < this.blocks[ x ].length; y++ ) {
            for ( var z = 0; z < this.blocks[ x ][ y ].length; z++ ) {
                func( this.blocks[ x ][ y ][ z ] );
            }
        }
    }

};
