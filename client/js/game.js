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
    player.position = p.position;
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

Game.prototype.updatePlayerVariable = function( data ) {

    // ASDFJKLASDKFJASKLDFJASL TODO BREAKS IF YOU PUT ANYTHING DIFFERENT IN THEN A VECTOR3
    console.log(data);
    var vec = new THREE.Vector3( data.val.x, data.val.y, data.val.z );
    console.log(vec);
    //this.world.players[ data.id ][ data.variable ] = vec;//data.val;
    console.log(this.world.players[ data.id ]);
    this.world.players[ data.id ].position.set( data.val.x, data.val.y, data.val.z );

    ///////////////A AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    //(atom is very laggy)
    //(fix)
}

Game.prototype.sendPlayerUpdate = function() {

    // TODO: TEMP TEMP TEMP FIND SOLUTION FOR THE PROTOTYPE PROBLEM TO ARRAY IS
    socket.emit( 'update', { id: this.player.userData.id, position: this.player.position } );

};

Game.prototype.sendPlayerUpdateVariable = function( variable, val ) {

    socket.emit( 'updateVariable', { id: this.player.userData.id, variable: variable, val: val } );

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

    //console.log('WTF' + playerspeed);


    if ( InputManager.isKeyDown( 87 /*w*/ ) ) {
        this.player.position.z += playerspeed;
    }
    if ( InputManager.isKeyDown( 83 /*s*/ ) ) {
        this.player.position.z -= playerspeed;
    }

    //console.log( prev.z !== this.player.position.z );

    if ( prev.z !== this.player.position.z ) {
        this.sendPlayerUpdateVariable( 'position', this.player.position );
    }
};

Game.prototype.mustRender = function() {
    return true;
};
