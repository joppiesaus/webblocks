var Game = function( data ) {

    this.world = {
        players: {},
    }
    this.player = null;

    this.init();
};

Game.prototype.createOtherPlayer = function( p ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
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
    return this.player = this.createOtherPlayer( p );

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

Game.prototype.updatePlayerVariable = function( data ) {

    this.world.players[ data.id ][ data.variable ] = data.val;

}

Game.prototype.sendPlayerUpdateVariable = function( variable, val ) {

    socket.emit( 'updateVariable', { id: this.player.userData.id, variable: variable, val: val } );

};

Game.prototype.sendPlayerUpdatePosition = function() {

    socket.emit( 'updatePlayerPosition', { id: this.player.userData.id, val: this.player.position } );

};

Game.prototype.init = function() {

    var light = new THREE.AmbientLight( 0x404040 );
    scene.add( light );

    camera.position.set( 3, 1, 1 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

};

Game.prototype.update = function( delta ) {

    if ( !this.player ) {
        return;
    }

    var playerspeed = 1 * delta * 5;
    var prev = this.player.position.clone();

    if ( InputManager.isKeyDown( 87 /*w*/ ) ) {
        this.player.position.z += playerspeed;
    }
    if ( InputManager.isKeyDown( 83 /*s*/ ) ) {
        this.player.position.z -= playerspeed;
    }

    if ( prev.z !== this.player.position.z ) {
        this.sendPlayerUpdatePosition();
        camera.lookAt( this.player.position );
    }
};

Game.prototype.mustRender = function() {
    return true;
};
