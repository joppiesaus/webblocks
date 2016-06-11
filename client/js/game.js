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
    controls.getObject().position.copy( this.player.position );
    this.player.userData.velocity = new THREE.Vector3( 0, 0, 0 );
    this.player.userData.selectedBlock = 2;

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

    var light = new THREE.AmbientLight( /*0x404040*/ 0xffffff );
    scene.add( light );

    window.addEventListener( 'mouseup', this.mouseUp, false );
    window.addEventListener( 'mousedown', this.mouseDown, false );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

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

    if ( InputManager.isKeyPressed( 49 /*1*/ ) ) {
        this.player.userData.selectedBlock = 1;
    }
    if ( InputManager.isKeyPressed( 50 /*2*/ ) ) {
        this.player.userData.selectedBlock = 2;
    }
    if ( InputManager.isKeyPressed( 51 /*3*/ ) ) {
        this.player.userData.selectedBlock = 3;
    }

    cObject.translateX( this.player.userData.velocity.x * delta );
    cObject.translateY( this.player.userData.velocity.y * delta );
    cObject.translateZ( this.player.userData.velocity.z * delta );

    this.player.position.copy( cObject.position );

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
