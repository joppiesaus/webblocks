var constants = {
    Blocksize: 1,
};

(function(){

    var material = new THREE.MeshBasicMaterial();
    var geometry = new THREE.CubeGeometry( constants.Blocksize, constants.Blocksize, constants.Blocksize );

    constants.CubeMesh = new THREE.Mesh( geometry, material );

})();
