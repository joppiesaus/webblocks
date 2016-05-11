var constants = {

    Blocksize: 1,

    Meshes: [ ],

};

(function(){

    var geometry = new THREE.CubeGeometry( constants.Blocksize, constants.Blocksize, constants.Blocksize );
    var material;

    // block
    material = new THREE.MeshNormalMaterial();
    constants.Meshes[ 1 ] = new THREE.Mesh( geometry, material.clone() );

    // another block
    material = new THREE.MeshBasicMaterial( { color: 0x669999 } );
    constants.Meshes[ 2 ] = new THREE.Mesh( geometry, material.clone() );

})();
