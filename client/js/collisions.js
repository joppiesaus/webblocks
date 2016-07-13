// Swept-AABB


var collisions = {

    blockBoxFromPosition: function( position ) {

        return new THREE.Box3(
            new THREE.Vector3(
                position.x - blockdata.HalfBlocksize,
                position.y - blockdata.HalfBlocksize,
                position.z - blockdata.HalfBlocksize
            ),
            new THREE.Vector3(
                position.x + blockdata.HalfBlocksize,
                position.y + blockdata.HalfBlocksize,
                position.z + blockdata.HalfBlocksize
            )
        );

    },

    sweptAABB: function( a, b ) {

    }

};
