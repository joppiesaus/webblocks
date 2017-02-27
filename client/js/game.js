var controls;

var Game = function( data ) {

    this.world = new World();
    this.player = null;

    this.init();
};

Game.prototype.createOtherPlayer = function( p ) {

    var geometry = new THREE.CubeGeometry( 1, 2, 1 );
    var material = new THREE.MeshBasicMaterial( { color: p.color } );

    var player = new THREE.Mesh( geometry, material );
    player.userData.id = p.id;
    player.position.set( p.position.x, p.position.y, p.position.z );
    scene.add( player );
    this.world.players[ p.id ] = player;

    console.log( 'Added player ' + p.id );

    return player;

};

// TODO: Move to seperate class, create methods like respawn, move, etc
Game.prototype.createPlayer = function( p ) {

    // TODO: player is also inside player list
    if ( this.player ) {
        // On a reconnect, remove the old one..?
        scene.remove( this.player );
    }
    this.player = this.createOtherPlayer( p );
    controls.getObject().position.copy( this.player.position );
    this.player.userData.velocity = new THREE.Vector3( 0, 0, 0 );
    this.player.userData.selectedBlock = 2;
    this.player.userData.collide = true;
    this.player.userData.flying = false;
    this.player.userData.onGround = false;
    this.player.userData.boundingBox = new THREE.Box3();
    this.player.userData.boundingBox.setFromObject( this.player );

};

Game.prototype.removePlayer = function( id ) {

    scene.remove( this.world.players[ id ] );
    this.world.players[ id ] = undefined;
    console.log( 'Removed player ' + id );

};

Game.prototype.updatePlayer = function( p ) {

    this.world.players[ p.id ].position = p.position;

};

Game.prototype.teleportToPlayer = function( id ) {

    this.player.position.copy( this.world.players[ id ].position );
    this.sendPlayerUpdateVector3( 'position' );

};

Game.prototype.doPlayerCollisions = function() {



};

Game.prototype.updatePlayerVector3 = function( data ) {

    this.world.players[ data.id ][ data.variable ].set( data.val.x, data.val.y, data.val.z );

};

Game.prototype.updatePlayerVariable = function( data ) {

    this.world.players[ data.id ][ data.variable ] = data.val;

}

Game.prototype.sendPlayerUpdateVariable = function( variable ) {

    socket.emit( 'updateVariable', { id: this.player.userData.id, variable: variable, val: this.player[ variable ] } );

};

Game.prototype.sendPlayerUpdateVector3 = function( variable ) {

    socket.emit( 'updatePlayerVector3', { id: this.player.userData.id, variable: variable, val: this.player[ variable ] } );

};

Game.prototype.init = function() {

    var light = new THREE.AmbientLight( /*0x404040*/ 0xffffff );
    scene.add( light );

    window.addEventListener( 'mouseup', this.mouseUp, false );
    window.addEventListener( 'mousedown', this.mouseDown, false );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

};

Game.prototype.importLevel = function( data ) {

    // TODO: Player respawning
    this.world.level.importData( data );

};

Game.prototype.mouseDown = function( evnt ) {

    if ( !controls.enabled ) return;
    switch ( evnt.which ) {

        case InputManager.LEFT_MOUSE_BUTTON:
            game.leftMouseDown = true;
            game.addBlockAtCrosshair();
            break;

        case InputManager.RIGHT_MOUSE_BUTTON:
            game.rightMouseDown = true;
            game.removeBlockAtCrosshair();
            break;

        case InputManager.MIDDLE_MOUSE_BUTTON:
            game.pickBlockAtCrosshair();
            break;

        default:
            break;
    }

};

Game.prototype.mouseUp = function( evnt ) {

    switch ( evnt.which ) {

        case InputManager.LEFT_MOUSE_BUTTON:
            game.leftMouseDown = false;
            break;

        case InputManager.RIGHT_MOUSE_BUTTON:
            game.rightMouseDown = false;
            break;

        default:
            break;
    }

};

Game.prototype.getChunkMeshArray = function() {

    var result = [];

    this.world.level.forEachChunk( chunk => {

        if ( chunk.mesh ) {
            result.push( chunk.mesh );
        }

    });

    return result;

};


Game.prototype.getBlockPositionAtCrosshair = function() {

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( new THREE.Vector2( 0, 0 ), camera );

    var intersects = raycaster.intersectObjects( this.getChunkMeshArray(), false );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];

        var position = intersect.point.clone();

        var positionBackup = position.clone();

        position.round();

        var normal = intersect.face.normal;
        var v = 'x';
        if ( normal.y ) v = 'y';
        else if ( normal.z ) v = 'z';

        position[ v ] = Math.floor( positionBackup[ v ] );
        if ( normal[ v ] < 0 ) position[ v ] += 1;

        return position;
    }

    return undefined;

};

Game.prototype.pickBlockAtCrosshair = function() {

    var pos = this.getBlockPositionAtCrosshair();

    if ( !pos ) return;

    this.player.userData.selectedBlock = this.world.level.getBlock( pos ).id;

};

Game.prototype.addBlockAtCrosshair = function() {

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( new THREE.Vector2( 0, 0 ), camera );

    var intersects = raycaster.intersectObjects( this.getChunkMeshArray(), false );

    if ( intersects.length > 0 ) {

        var intersect = intersects[ 0 ];
        var position = intersect.point.clone();
        var positionBackup = position.clone();

        position.round();

        var normal = intersect.face.normal;

        var v = 'x';
        if ( normal.y ) v = 'y';
        else if ( normal.z ) v = 'z';

        position[ v ] = Math.floor( positionBackup[ v ] );

        if ( normal[ v ] > 0 ) position[ v ] += 1;

        // Block out of bounds
        if ( position[ v ] < 0 || position[ v ] >= this.world.level.size[ v ] ) return;

        // Check if the block collides with the player
        if ( this.player.userData.collide ) {

            this.player.userData.boundingBox.setFromObject( this.player );

            var bbb = collisions.blockBoxFromPosition( position );

            // If it does, do not place the block
            if ( this.player.userData.boundingBox.intersectsBox( bbb ) ) return;

        }

        var block = new Block( this.player.userData.selectedBlock );
        block.position = position;
        this.world.level.addBlock( block );

    }

};

Game.prototype.removeBlockAtCrosshair = function() {

    var pos = this.getBlockPositionAtCrosshair();

    if ( !pos ) return;

    this.world.level.removeBlockAtPosition( pos );

};

Game.prototype.update = function( delta ) {

    if ( !this.player ) {
        return;
    }

    if ( InputManager.isKeyPressed( 49 /*1*/ ) ) {
        this.player.userData.selectedBlock = 1;
    }
    if ( InputManager.isKeyPressed( 50 /*2*/ ) ) {
        this.player.userData.selectedBlock = 2;
    }
    if ( InputManager.isKeyPressed( 51 /*3*/ ) ) {
        this.player.userData.selectedBlock = 3;
    }

    var playerspeed = 1 * delta * 250.0;
    var cObject = controls.getObject();
    var prev = this.player.position.clone();

    if ( this.player.userData.prevPosition !== this.player.position.x ||
         this.player.userData.prevPosition !== this.player.position.y ||
         this.player.userData.prevPosition !== this.player.position.z ) {
        // Assumes the server is aware of this position
        //this.sendPlayerUpdateVector3( 'position' );
        cObject.position.copy( this.player.position );
        prev.copy( this.player.position );
    }

    if ( this.player.userData.flying )
    {
        this.player.userData.velocity.x -= this.player.userData.velocity.x * 10.0 * delta;
        this.player.userData.velocity.y -= this.player.userData.velocity.y * 10.0 * delta;
        this.player.userData.velocity.z -= this.player.userData.velocity.z * 10.0 * delta;

        if ( InputManager.isKeyDown( 87 /*w*/ ) ) {
            this.player.userData.velocity.z -= playerspeed;
        }
        if ( InputManager.isKeyDown( 83 /*s*/ ) ) {
            this.player.userData.velocity.z += playerspeed;
        }
        if ( InputManager.isKeyDown( 65 /*a*/ ) ) {
            this.player.userData.velocity.x -= playerspeed;
        }
        if ( InputManager.isKeyDown( 68 /*d*/ ) ) {
            this.player.userData.velocity.x += playerspeed;
        }
        if ( InputManager.isKeyDown( 32 /*spacebar*/ ) ) {
            this.player.userData.velocity.y += playerspeed;
        }
        if ( InputManager.isKeyDown( 16 /*shift*/ ) ) {
            this.player.userData.velocity.y -= playerspeed;
        }
    }
    else
    {
        this.player.userData.velocity.x = 0;
        this.player.userData.velocity.z = 0;

        if ( !this.player.userData.onGround ) {
            this.player.userData.velocity.y -= 9.81 * delta;
            if ( this.player.position.y <= 0.5 ) {
                this.player.position.y = 0.5;
                this.player.userData.velocity.y = 0;
                this.player.userData.onGround = true;
            }
        }

        var speed = 310 * delta;

        if ( InputManager.isKeyDown( 16 /*shift*/ ) ) {
            speed *= 2.2;
        }

        if ( InputManager.isKeyDown( 87 /*w*/ ) ) {
            this.player.userData.velocity.z = -speed;
        }
        if ( InputManager.isKeyDown( 83 /*s*/ ) ) {
            this.player.userData.velocity.z = speed;
        }
        if ( InputManager.isKeyDown( 65 /*a*/ ) ) {
            this.player.userData.velocity.x = -speed;
        }
        if ( InputManager.isKeyDown( 68 /*d*/ ) ) {
            this.player.userData.velocity.x = speed;
        }
        if ( InputManager.isKeyDown( 32 /*spacebar*/ ) &&
            this.player.userData.onGround ) {
            this.player.userData.onGround = false;
            this.player.userData.velocity.y = 5;
        }

    }

    var vel = this.player.userData.velocity.clone().multiplyScalar( delta );

    if ( vel.length() > 0.0 ) {

        var beforeTranslation = cObject.position.clone();

        cObject.translateX( vel.x );
        cObject.translateY( vel.y );
        cObject.translateZ( vel.z );

        vel.copy( cObject.position ).sub( beforeTranslation );

        cObject.position.copy( beforeTranslation );

        // Do player collision
        if ( this.player.userData.collide ) {
            this.player.userData.boundingBox.setFromObject( this.player );
            //var prevOnGround = this.player.userData.onGround;
            //console.log(this.player.userData.onGround);
            this.player.userData.onGround = false;

            var collision = collisions.collideWithBlocks( this.player.userData.boundingBox, vel );

            // Collision detected
            if ( collision.entryTime < 1.0 ) {
                console.log( collision );
                console.log( vel );


                if ( collision.normal.y ) {
                    this.player.userData.velocity.y = 0;

                    if ( collision.normal.y === 1 ) {

                        // FIX THIS
                        /*if ( prevOnGround ) {
                            vel.y = 0;
                            collision.entryTime = 1;
                        }*/
                        this.player.userData.onGround = true;

                    }
                }
                //if ( collision.normal.y !== 1 ) console.warn("NOT NORMALY 1")

                vel.multiplyScalar( collision.entryTime );

                ///////////////////////////// I HAVE NO IDEA WHAT I'M DOING

                // Slide!
                var remainingTime = 1.0 - collision.entryTime;
                //vel.projectOnPlane( collision.normal ).multiplyScalar( remainingTime );
                vel.projectOnPlane( collision.normal ).multiplyScalar( 1 + remainingTime );
                /*var velcpy = vel.clone();
                console.log(velcpy);
                velcpy.projectOnVector( collision.normal ).multiplyScalar( remainingTime );
                console.log(velcpy);
                vel.projectOnPlane( collision.normal );
                console.log(vel);
                vel.add( velcpy );
                console.log(vel);*/
            }
        }

        cObject.position.add( vel );

        this.player.position.copy( cObject.position );

    }

    if ( prev.x !== this.player.position.x ||
         prev.y !== this.player.position.y ||
         prev.z !== this.player.position.z ) {
        this.sendPlayerUpdateVector3( 'position' );
    }

    this.player.userData.prevPosition = this.player.position.clone();

};

Game.prototype.mustRender = function() {
    return true;
};
