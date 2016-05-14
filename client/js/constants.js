const constants = {

    Blocksize: 0x1,
    Chunksize: 0x10,

};

var blockdata = {

    Meshes: [ ],
    Materials: [ ],

    ChunkMaterial: null,

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

    var loader = new THREE.TextureLoader();

    // You're just here to fill the array
    blockdata.Meshes[ 0 ] = new THREE.Mesh( createGeometry( 0 ), new THREE.MeshBasicMaterial() );

    // block
    material = new THREE.MeshLambertMaterial( { map: loader.load( "res/tex/grass.png" ), color: 0x88bb88 } );
    blockdata.Meshes[ 1 ] = new THREE.Mesh( createGeometry( 1 ), material.clone() );

    // another block
    material = new THREE.MeshLambertMaterial( { map: loader.load( "res/tex/stone.png" ), color: 0x888888 } );
    blockdata.Meshes[ 2 ] = new THREE.Mesh( createGeometry( 2 ), material.clone() );

    // moar block
    material = new THREE.MeshLambertMaterial( { map: loader.load( "res/tex/dirt.png" ), color: 0xffffff } );
    blockdata.Meshes[ 3 ] = new THREE.Mesh( createGeometry( 3 ), material.clone() );


    // Setup material array
    for ( var i = 0; i < blockdata.Meshes.length; i++ ) {
        blockdata.Materials.push( blockdata.Meshes[ i ].material );
    }

    blockdata.ChunkMaterial = new THREE.MeshFaceMaterial( blockdata.Materials );

})();
