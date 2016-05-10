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

        if ( !this.id ) {
            // Air
            return;
        }

        var color = 0;

        switch ( this.id ) {

            case 1:
                color = 0x00ff00;
                break;
            case 2:
                color = 0xffffff * Math.random();
                break;

        }

        /*this.mesh = constants.CubeMesh.clone();
        this.mesh.material.color = new THREE.Color( color );*/

        //var geometry = new THREE.CubeGeometry( constants.Blocksize, constants.Blocksize, constants.Blocksize );
        //var material = new THREE.MeshBasicMaterial( { color: color } );
        this.mesh = constants.CubeMesh.clone();//new THREE.Mesh( constants.CubeMesh.geometry.clone(), material );
        this.mesh.material = new THREE.MeshBasicMaterial( { color: color } );
        this.mesh.position.copy( this.realWorldPosition() );

        scene.add( this.mesh );

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
