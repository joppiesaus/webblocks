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

    sweptAABB: function( a, b, aVel ) {

        var normal = new THREE.Vector3();

        // Think of these as a bullet.
        var invEntry = new THREE.Vector3(); // Entry distance of collision
        var invExit = new THREE.Vector3(); // Exit distance of collision

        // Calculate entry and exit distances
        if ( aVel.x > 0.0 ) {
            invEntry.x = b.min.x - a.max.x;
            invExit.x = b.max.x - a.min.x;
        } else {
            invEntry.x = b.max.x - a.min.x;
            invExit.x = b.min.x - a.max.x;
        }
        if ( aVel.y > 0.0 ) {
            invEntry.y = b.min.y - a.max.y;
            invExit.y = b.max.y - a.min.y;
        } else {
            invEntry.y = b.max.y - a.min.y.y;
            invExit.y = b.min.y - a.max.y;
        }
        if ( aVel.z > 0.0 ) {
            invEntry.z = b.min.z - a.max.z;
            invExit.z = b.max.z - a.min.z;
        } else {
            invEntry.z = b.max.z - a.min.z;
            invExit.z = b.min.z - a.max.z;
        }

        var entry = new THREE.Vector3(); // Entry time of collision
        var exit = new THREE.Vector3(); // Exit time of collision

        // Calculate time of entry and exit
        if ( aVel.x == 0.0 ) {
            entry.x = -Infinity;
            exit.x = Infinity;
        } else {
            entry.x = invEntry.x / aVel.x;
            exit.x = invExit.x / aVel.x;
        }
        if ( aVel.y == 0.0 ) {
            entry.y = -Infinity;
            exit.y = Infinity;
        } else {
            entry.y = invEntry.y / aVel.y;
            exit.y = invExit.y / aVel.y;
        }
        if ( aVel.z == 0.0 ) {
            entry.z = -Infinity;
            exit.z = Infinity;
        } else {
            entry.z = invEntry.z / aVel.z;
            exit.z = invExit.z / aVel.z;
        }

        // Calulates teh timez
        var entryTime = Math.max( entry.x, entry.y, entry.z );
        var exitTime = Math.min( exit.x, exit.y, exit.z );

        // No collision
        if ( entryTime > exitTime || entryTime > 1 ) {

            return {
                entryTime: 1,
                normal: normal,
                exitTime: Infinity,
                invEntry: invEntry,
                invExit: invExit,
                entry: entry,
                exit: exit
            };

        } else {
            // There is an collision!
            // Find the affected normals

            // y is the most expected collision(Jumping n stuff)

            if ( entry.y > entry.x && entry.y > entry.z ) {
                normal.y = ( aVel.y < 0 ) ? 1 : -1;
            } else if ( entry.x > entry.y && entry.x > entry.z ) {
                normal.x  = ( aVel.x < 0 ) ? 1 : -1;
            } else if ( entry.z > entry.x && entry.z > entry.y ) {
                normal.z = ( aVel.z < 0 ) ? 1 : -1;
            } else {
                // Two sides collided at the same time
                if ( Math.abs( aVel.y ) < Math.abs( aVel.x ) &&
                     Math.abs( aVel.y ) < Math.abs( aVel.z ) )
                {
                    normal.y = ( aVel.y < 0 ) ? 1 : -1;
                }
                else if ( Math.abs( aVel.x ) < Math.abs( aVel.y ) &&
                          Math.abs( aVel.x ) < Math.abs( aVel.z ) )
                {
                    normal.x = ( aVel.x < 0 ) ? 1 : -1;
                }
                else if ( Math.abs( aVel.z ) < Math.abs( aVel.x ) &&
                          Math.abs( aVel.z ) < Math.abs( aVel.y ) )
                {
                    normal.z = ( aVel.z < 0 ) ? 1 : -1;
                }
            }

            return {
                entryTime: entryTime,
                normal: normal,
                exitTime: exitTime,
                invEntry: invEntry,
                invExit: invExit,
                entry: entry,
                exit: exit
            }

        }

        throw up;

    },

    collideWithBlocks: function( a, velocity ) {

        // TODO

    },

};
