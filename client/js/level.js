
var Level = function() {

    this.blocks = [];

};

Level.prototype.importData = function( data ) {

    this.size = new THREE.Vector3( data.size.x, data.size.y, data.size.z );

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

                block.setup();
                yArr.push( block );

            }

            xArr.push( yArr );

        }

        this.blocks.push( xArr );

    }

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

Level.prototype.forEachBlock = function( func ) {

    for ( var x = 0; x < this.blocks.length; x++ ) {
        for ( var y = 0; y < this.blocks[ x ].length; y++ ) {
            for ( var z = 0; z < this.blocks[ x ][ y ].length; z++ ) {
                func( this.blocks[ x ][ y ][ z ] );
            }
        }
    }

};
