var constants = {

    Blocksize: 1,
    Chunksize: 0x10,

    Meshes: [ ],

};

(function(){

    var cubeGeometry = new THREE.CubeGeometry( constants.Blocksize, constants.Blocksize, constants.Blocksize );

    var createGeometry = function( id ) {

        var g = cubeGeometry.clone();

        for ( var i = 0; i < g.faces.length; i++ ) {
            g.faces[ i ].materialIndex = id;
        }

        return g;

    };

    var material;

    // You're just here to fill the array
    constants.Meshes[ 0 ] = new THREE.Mesh( createGeometry( 0 ), new THREE.MeshBasicMaterial() );

    // block
    material = new THREE.MeshNormalMaterial();
    constants.Meshes[ 1 ] = new THREE.Mesh( createGeometry( 1 ), material.clone() );

    // another block
    material = new THREE.MeshBasicMaterial( { color: 0x669999 } );
    constants.Meshes[ 2 ] = new THREE.Mesh( createGeometry( 2 ), material.clone() );

})();
