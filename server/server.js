var THREE = require('three');

var players = {};

var Player = function(id) {

    this.id = id;
    this.name = '';
    this.position = new THREE.Vector3(
        Math.random() * 2.0,
        0,
        Math.random() * 2.0
    );
    this.color = Math.random() * 0xffffff;
};

exports.addPlayer = function(id) {

    var p = new Player(id);
    players[id] = p;
    return p;

};

exports.updatePlayerData = function(data) {
    return players[data.id] = data;
};

exports.updatePlayerVariable = function(id, variable, value) {
    players[id][variable] = value;
};

exports.removePlayerById = function(id) {
    delete players[id];
};

exports.removePlayer = function(player) {
    delete players[player.id];
};

exports.generateLevel = function() {
    var level = { blocks: [] };

    for (var x = 0; x < 12; x++) {
        for (var z = 0; z < 12; z++){
            level.blocks.push({ id: Math.floor( Math.random() * 2 ) + 1, position: { x: x, y: -1, z: z }});
        }
    }

    return level;
};

exports.players = players;
