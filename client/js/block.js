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

        var color = 0;

        switch ( this.id ) {

            case 1:
                color = 0x00ff00;
                break;
            case 2:
                color = 0xffffff * Math.random();
                break;

        }

        this.mesh = constants.CubeMesh.clone();
        this.mesh.material.color = new THREE.Color( color );
        this.mesh.position.copy( this.realWorldPosition() );

        scene.add( this.mesh );

    },

    removeFromScene: function() {

        if ( !this.mesh ) {

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
