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

Chunk.prototype.destroy = function() {

    if ( this.mesh ) {
        scene.remove( this.mesh );
    }

    this.blocks = [ ];

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

    var scope = this;

    // Returns true if there's a neighbouring block outside of the chunk
    var isExternalBlock = function( pos, v, neg ) {

        if ( neg ) {

            if ( scope.position[ v ] === 0 ) return false;

            var p = scope.position.clone();
            var cPos = pos.clone();

            p[ v ] -= 1;
            cPos[ v ] = constants.Chunksize - 1;

            if ( !game.world.level.chunks[ p.x ][ p.y ][ p.z ]
                .blocks[ cPos.x ][ cPos.y ][ cPos.z ].id ) {
                    return false;
            }
            return true;

        } else {

            if ( scope.position[ v ] === game.world.level.chunkSize[ v ] - 1 ) return false;

            var p = scope.position.clone();
            var cPos = pos.clone();

            p[ v ] += 1;
            cPos[ v ] = 0;

            if ( !game.world.level.chunks[ p.x ][ p.y ][ p.z ]
                .blocks[ cPos.x ][ cPos.y ][ cPos.z ].id ) {
                    return false;
            }
            return true;

        }

    };

    // Returns true if there's a neighbouring block
    var isBlock = function( pos, v, val ) {

        if ( val < 0 ) {
            if ( pos[ v ] === 0 ) return isExternalBlock( pos, v, true );
        } else {
            if ( pos[ v ] === constants.Chunksize - 1 ) return isExternalBlock( pos, v, false );
        }

        var p = new THREE.Vector3( pos.x, pos.y, pos.z );
        p[ v ] += val;

        if ( !scope.blocks[ p.x ][ p.y ][ p.z ].id ) {
            return false;
        }
        return true;

    };

    var adjustGeometry = function( geo, pos ) {

        var toDelete = [ ];

        for ( var i = 0; i < geo.faces.length; i += 2 ) {

            var normal = geo.faces[ i ].normal;

            var v = 'x';
            if ( normal.y ) v = 'y';
            else if ( normal.z ) v = 'z';

            val = normal[ v ];

            // Block already there, may remove now
            if ( isBlock( pos, v, val ) ) {
                toDelete.push( i );
            }

        }

        if ( toDelete.length * 2 == geo.faces.length ) {
            return true;
        }

        for ( var i = 0; i < toDelete.length; i++ ) {
            delete geo.faces[ toDelete[ i ] ];
            delete geo.faces[ toDelete[ i ] + 1 ];
        }

        // uncomment for lolz
        //delete geo.faces[ 5 ];

        geo.faces = geo.faces.filter( v => v );
        geo.elementsNeedUpdate = true;

        return false;

    };

    for ( var x = 0; x < constants.Chunksize; x++ ) {
        for ( var y = 0; y < constants.Chunksize; y++ ) {
            for ( var z = 0; z < constants.Chunksize; z++ ) {

                var block = this.blocks[ x ][ y ][ z ];

                // Air
                if ( !block.id ) continue;

                var pos = new THREE.Vector3( x, y, z );
                var bGeometry = blockdata.Meshes[ block.id ].geometry.clone();

                if ( adjustGeometry( bGeometry, pos ) ) {
                    continue;
                }

                matrix.makeTranslation(
                    block.position.x,
                    block.position.y,
                    block.position.z
                );

                geometry.merge(
                    bGeometry,
                    matrix
                );

            }
        }
    }

    this.mesh = new THREE.Mesh( geometry, blockdata.ChunkMaterial );
    scene.add( this.mesh );

};
