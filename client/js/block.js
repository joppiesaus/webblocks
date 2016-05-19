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

    setup: function() {

        /*// temporary

        if ( !this.id ) {
            // Air
            return;
        }

        */

    },

    remove: function() {

        this.id = 0;
        if ( this.mesh ) this.mesh = undefined;
        socket.emit( 'blockRemove', { position: this.position } );

    },

    removeFromServer: function() {

        this.id = 0;
        if ( this.mesh ) this.mesh = undefined;

    },

}
