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

Game.prototype.createPlayer = function( p ) {

    // TODO: player is also inside player list
    if ( this.player ) {
        // On a reconnect, remove the old one..?
        scene.remove( this.player );
    }
    this.player = this.createOtherPlayer( p );
    this.player.userData.velocity = new THREE.Vector3( 0, 0, 0 );

};

Game.prototype.removePlayer = function( id ) {

    scene.remove( this.world.players[ id ] );
    this.world.players[ id ] = undefined;
    console.log( 'Removed player ' + id );

};

Game.prototype.updatePlayer = function( p ) {

    this.world.players[ p.id ].position = p.position;

};

Game.prototype.updatePlayerPosition = function( data ) {

    this.world.players[ data.id ].position.set( data.val.x, data.val.y, data.val.z );

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

Game.prototype.sendPlayerUpdatePosition = function() {

    socket.emit( 'updatePlayerPosition', { id: this.player.userData.id, val: this.player.position } );

};

Game.prototype.init = function() {

    var light = new THREE.AmbientLight( 0x404040 );
    scene.add( light );

    // torus knot as orientation point
    /*var oGeometry = new THREE.TorusKnotGeometry( 10, 3, 64, 8 );
    var oMaterial = new THREE.MeshNormalMaterial();
    var orientationPoint = new THREE.Mesh( oGeometry, oMaterial );
    orientationPoint.position.set( 0, 0, 0 );
    scene.add( orientationPoint );*/

    window.addEventListener( 'mouseup', this.mouseUp, false );
    window.addEventListener( 'mousedown', this.mouseDown, false );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );
};

Game.prototype.mouseDown = function( evnt ) {

    switch ( evnt.which ) {

        case InputManager.LEFT_MOUSE_BUTTON:
            game.leftMouseDown = true;
            game.addBlockAtCrosshair();
            break;

        case InputManager.RIGHT_MOUSE_BUTTON:
            game.rightMouseDown = true;
            game.removeBlockAtCrosshair();
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

Game.prototype.getBlockMeshArray = function() {

    var result = [];

    this.world.level.forEachBlock( block => {

        if ( block.mesh ) {
            result.push( block.mesh );
        }

    });

    return result;

};


// TODO: Server side
Game.prototype.addBlockAtCrosshair = function() {

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( new THREE.Vector2( 0, 0 ), camera );

    var intersects = raycaster.intersectObjects( this.getBlockMeshArray(), false );

    if ( intersects.length > 0 ) {

        var collided = intersects[ 0 ];
        var collidedPosition = collided.point;
        var collidedBlock = collided.object;

        var delta = collidedPosition.clone();
        delta.sub( collidedBlock.position );

        var absDelta = new THREE.Vector3(
            Math.abs( delta.x ),
            Math.abs( delta.y ),
            Math.abs( delta.z )
        );

        var biggest = { var: 'x', val: absDelta.x };
        if ( absDelta.y > biggest.val ) {
            biggest.var = 'y';
            biggest.val = absDelta.y;
        }
        if ( absDelta.z > biggest.val ) {
            biggest.var = 'z';
            //biggest.val = absDelta.z;
        }

        var finalPosition = collidedBlock.position.clone();
        finalPosition[ biggest.var ] += delta[ biggest.var ] > 0 ? 1 : -1;


        var block = new Block( 2 );
        block.position = finalPosition;
        this.world.level.addBlock( block );
    }

};

Game.prototype.removeBlockAtCrosshair = function() {

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( new THREE.Vector2( 0, 0 ), camera );

    var intersects = raycaster.intersectObjects( this.getBlockMeshArray(), false );

    if ( intersects.length > 0 ) {

        var block = intersects[ 0 ].object;

        this.world.level.removeBlockAtPosition( block.position );

    }
};

Game.prototype.update = function( delta ) {

    if ( !this.player ) {
        return;
    }

    var playerspeed = 1 * delta * 250.0;
    var cObject = controls.getObject();
    var prev = this.player.position.clone();

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

    cObject.translateX( this.player.userData.velocity.x * delta );
    cObject.translateY( this.player.userData.velocity.y * delta );
    cObject.translateZ( this.player.userData.velocity.z * delta );

    this.player.position.set( cObject.position.x, cObject.position.y, cObject.position.z );

    if ( prev.x !== this.player.position.x ||
         prev.y !== this.player.position.y ||
         prev.z !== this.player.position.z ) {
        //this.sendPlayerUpdatePosition();
        this.sendPlayerUpdateVector3( 'position' );
    }

};

Game.prototype.mustRender = function() {
    return true;
};
