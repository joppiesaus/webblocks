
var Level = function() {
    this.blocks = [];
};

Level.prototype.importData = function( data ) {

    data.blocks.forEach( b => {

        var block = new Block();
        block.importData( b );
        block.setup();
        this.blocks.push( block );

    });

};

Level.prototype.exportData = function() {

};

Level.prototype.addBlockFromServer = function( data ) {

    var block = new Block();
    block.importData( data );
    block.setup();
    this.blocks.push( block );

};
