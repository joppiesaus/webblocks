// This file contains block stuff
// I am terrible at documenting things

function Block( id ) {
    // sheep go here
    this.id = id;
}

Block.prototype = {

    id: undefined,
    position: new THREE.Vector3(),
    mesh: undefined,
    visible: true,

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

        // temporary

        if ( !this.id ) {
            // Air
            return;
        }

        this.mesh = blockdata.Meshes[ this.id ].clone();
        this.mesh.position.copy( this.position );

        //scene.add( this.mesh );

    },

    remove: function() {

        this.id = 0;
        this.removeFromScene();
        socket.emit( 'blockRemove', { position: this.position } );

    },

    removeFromServer: function() {

        this.id = 0;
        this.removeFromScene();

    },

    removeFromScene: function() {

        if ( this.mesh ) {

            scene.remove( this.mesh );
            this.mesh = undefined;

        }
    },

    realWorldPosition: function() {

        var v = this.position.clone();
        v.multiplyScalar( constants.Blocksize );
        return v;

    },

}
