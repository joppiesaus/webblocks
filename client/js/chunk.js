// I'm learning so much here!

var Chunk = function( blocks, position ) {

    this.mesh = null;
    this.blocks = blocks;
    this.position = position;

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

    var surrounded = true;
    var scope = this;

    var isExternalBlock = function( pos, v, neg ) {

        if ( neg ) {

            if ( scope.position[ v ] === 0 ) return surrounded = false;

            var p = scope.position.clone();
            var cPos = pos.clone();

            p[ v ] -= 1;
            cPos[ v ] = constants.Chunksize - 1;

            if ( !game.world.level.chunks[ p.x ][ p.y ][ p.z ]
                .blocks[ cPos.x ][ cPos.y ][ cPos.z ].id ) {
                    return surrounded = false;
            }
            return true;

        } else {

            if ( scope.position[ v ] === game.world.level.chunkSize[ v ] - 1 ) return surrounded = false;

            var p = scope.position.clone();
            var cPos = pos.clone();

            p[ v ] += 1;
            cPos[ v ] = 0;

            if ( !game.world.level.chunks[ p.x ][ p.y ][ p.z ]
                .blocks[ cPos.x ][ cPos.y ][ cPos.z ].id ) {
                    return surrounded = false;
            }
            return true;

        }

    };

    var isBlock = function( pos, v, val ) {

        if ( val < 0 ) {
            if ( pos[ v ] === 0 ) return isExternalBlock( pos, v, true );
        } else {
            if ( pos[ v ] === constants.Chunksize - 1 ) return isExternalBlock( pos, v, false );
        }

        var p = new THREE.Vector3( pos.x, pos.y, pos.z );
        p[ v ] += val;

        if ( !scope.blocks[ p.x ][ p.y ][ p.z ].id ) {
            return surrounded = false;
        }
        return true;

    };

    for ( var x = 0; x < constants.Chunksize; x++ ) {
        for ( var y = 0; y < constants.Chunksize; y++ ) {
            for ( var z = 0; z < constants.Chunksize; z++ ) {

                var block = this.blocks[ x ][ y ][ z ];

                // Air
                if ( !block.id ) continue;

                surrounded = true;
                var pos = new THREE.Vector3( x, y, z );

                isBlock( pos, 'x', -1 );
                isBlock( pos, 'x', 1 );
                isBlock( pos, 'y', -1 );
                isBlock( pos, 'y', 1 );
                isBlock( pos, 'z', -1 );
                isBlock( pos, 'z', 1 );

                if ( surrounded ) {
                    continue;
                }

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
