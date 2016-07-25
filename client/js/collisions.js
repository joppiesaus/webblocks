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
        // Sumeting wong here
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

    createBroadBox: function( a, v ) {

        return new THREE.Box3(
            new THREE.Vector3(
                v.x > 0 ? a.min.x : a.min.x + v.x,
                v.y > 0 ? a.min.y : a.min.y + v.y,
                v.z > 0 ? a.min.z : a.min.z + v.z
            ),
            new THREE.Vector3(
                v.x > 0 ? a.max.x + v.x : a.max.x - v.x,
                v.y > 0 ? a.max.y + v.y : a.max.y - v.y,
                v.z > 0 ? a.max.z + v.z : a.max.z - v.z
            )
        );

    },

    collideWithBlocks: function( a, velocity ) {

        var toGrid = function( pos ) {
            return pos.floor();
        };

        var distance = velocity.length();
        var loops = Math.ceil( distance );
        var broadBox = this.createBroadBox( a, velocity );
        var face, vel, box;

        for ( var i = 1; i <= loops; i++ ) {

            vel = velocity.clone().divideScalar( loops ).multiplyScalar( i );
            box = a.clone().translate( vel );

            var t = [ ];
            if ( vel.y !== 0.0 ) {
                face = vel.y < 0.0 ? box.min.y : box.max.y;
                t.push( ( new THREE.Vector3( box.max.x, face, box.max.z ) ).floor() );
                t.push( ( new THREE.Vector3( box.max.x, face, box.min.z ) ).floor() );
                t.push( ( new THREE.Vector3( box.min.x, face, box.max.z ) ).floor() );
                t.push( ( new THREE.Vector3( box.min.x, face, box.min.z ) ).floor() );
            }
            if ( vel.x !== 0.0 ) {
                face = vel.x < 0.0 ? box.min.x : box.max.x;
                t.push( ( new THREE.Vector3( face, box.max.y, box.max.z ) ).floor() );
                t.push( ( new THREE.Vector3( face, box.max.y, box.min.z ) ).floor() );
                t.push( ( new THREE.Vector3( face, box.min.y, box.max.z ) ).floor() );
                t.push( ( new THREE.Vector3( face, box.min.y, box.min.z ) ).floor() );
            }
            if ( vel.z !== 0.0 ) {
                face = vel.z < 0.0 ? box.min.z : box.max.z;
                t.push( ( new THREE.Vector3( box.max.x, box.max.y, face ) ).floor() );
                t.push( ( new THREE.Vector3( box.min.x, box.max.y, face ) ).floor() );
                t.push( ( new THREE.Vector3( box.max.x, box.min.y, face ) ).floor() );
                t.push( ( new THREE.Vector3( box.min.x, box.min.y, face ) ).floor() );
            }

            // TODO: Remove duplicates
            var corners = t;

            // Check teh cornerz
            for ( var j = 0; j < corners.length; j++ ) {

                var block = game.world.level.getBlockUncheckedBounds( corners[ j ] );

                if ( !block || !block.id ) continue;

                // TODO: Check if block is collidable, etc

                var blockCol = this.blockBoxFromPosition( corners[ j ] );

                if ( broadBox.intersectsBox( blockCol ) ) {
                    return this.sweptAABB( a, blockCol, velocity );
                }

            }

        }

        // No collision found!
        return {
            time: 1,
            normal: new THREE.Vector3(),
            exitTime: Infinity,
            invEntry: new THREE.Vector3(),
            invExit: new THREE.Vector3(),
            entry: new THREE.Vector3( 1, 1, 1 ),
            exit: new THREE.Vector3( Infinity, Infinity, Infinity )
        };

    },

};
