var controls;

var Game = function( data ) {

    this.world = {
        players: {},
    }
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

    var oGeometry = new THREE.TorusKnotGeometry( 10, 3, 64, 8 );
    var oMaterial = new THREE.MeshNormalMaterial();
    var orientationPoint = new THREE.Mesh( oGeometry, oMaterial );
    orientationPoint.position.set( 0, 0, 0 );
    scene.add( orientationPoint );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );
};

Game.prototype.initLevel = function( data ) {

    this.world.level = data;

    for ( var i = 0; i < this.world.level.blocks.length; i++ ) {

        var blockdata = this.world.level.blocks[ i ];
        var block = new Block();
        block.importData( blockdata );
        block.setup();
        this.world.level.blocks[ i ] = block;

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

Game.prototype.onMouseMove = function( evnt ) {

    var raycaster = new Raycaster();
    raycaster.setFromCamera( new Vector2( 0, 0 ), camera );

    var intersects = raycaster.intersectsObjects( this.game.world.blocks );

};

Game.prototype.mustRender = function() {
    return true;
};
