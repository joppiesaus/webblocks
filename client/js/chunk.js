// I'm learning so much here!

var Chunk = function( blocks, position ) {

    this.mesh = null;
    this.blocks = blocks;

};

Chunk.prototype.importData = function( data ) {

};

Chunk.prototype.exportData = function() {

};

// Gives all the blocks in this chunk a .chunk property, pointing to this chunk
Chunk.prototype.markBlocks = function() {

    this.forEachBlock( block => {
        block.chunk = this;
    });

};

Chunk.prototype.forEachBlock = function( func ) {

    for ( var x = 0; x < constants.Chunksize; x++ ) {

        for ( var y = 0; y < constants.Chunksize; y++ ) {

            for ( var z = 0; z < constants.Chunksize; z++ ) {

                func( this.blocks[ x ][ y ][ z ] );

            }

        }

    }

}

Chunk.prototype.build = function() {

    // Remove old mesh
    if ( this.mesh ) {
        scene.remove( this.mesh );
    }

    var geometry = new THREE.Geometry();

    var matrix = new THREE.Matrix4();

    for ( var x = 0; x < constants.Chunksize; x++ ) {
        for ( var y = 0; y < constants.Chunksize; y++ ) {
            for ( var z = 0; z < constants.Chunksize; z++ ) {

                var block = this.blocks[ x ][ y ][ z ];

                // Air
                if ( !block.id ) continue;

                // TODO: Merge only blocks that are visible
                // TODO: Merge only faces that are visible

                matrix.makeTranslation(
                    block.position.x,
                    block.position.y,
                    block.position.z
                );

                geometry.merge(
                    blockdata.Meshes[ block.id ].geometry,
                    matrix
                );

            }
        }
    }

    this.mesh = new THREE.Mesh( geometry, blockdata.ChunkMaterial );
    scene.add( this.mesh );

};
