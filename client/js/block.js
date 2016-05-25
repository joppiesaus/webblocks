// This file contains block stuff
// I am terrible at documenting things

function Block( id ) {
    // sheep go here
    this.id = id;
}

Block.prototype = {

    id: undefined,
    position: new THREE.Vector3(),

    importData: function( data ) {

        this.id = data.id;
        this.position = new THREE.Vector3( data.position.x, data.position.y, data.position.z );

    },

    exportData: function() {

        return {

            id: this.id,
            position: this.position,

        };

    },

    remove: function() {

        this.id = 0;

    },
    
}
