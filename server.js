var express = require("express");
var app = express();
var io = require('socket.io');
var http = require('http').Server(app);
var Player = require("./Player").Player;

app.use(express.static('public'));

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
var sio = io.listen(http);
sio.sockets.on('connection', function(client) {
    console.log("New player: " + client.id);
    // Listen for client disconnected
    client.on("disconnect", onClientDisconnect);
    // Listen for new player message
    client.on("new player", onNewPlayer);
    // Listen for move player message
    client.on("move player", onMovePlayer);

    client.on("bulletShot", onBulletShot);

    client.on('report hit', onReportHit);

});


var players = [];



// Socket client has disconnected
function onClientDisconnect() {
    console.log("Player has disconnected: " + this.id);

    var removePlayer = playerById(this.id);

    // Player not found
    if (!removePlayer) {
        console.log("Player not found: " + this.id);
        return;
    };

    // Remove player from players array
    players.splice(players.indexOf(removePlayer), 1);

    // Broadcast removed player to connected socket clients
    this.broadcast.emit("remove player", {
        id: this.id
    });
};

function onNewPlayer() {
    // Create a new player
    var newPlayer = new Player(Math.random() * 1000, Math.random() * 1000);
    newPlayer.id = this.id;
    newPlayer.lives = 3;

    //Random color
    newPlayer.color = '0x' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
    // Broadcast new player to connected socket clients
    this.broadcast.emit("new player", {
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY(),
        color: newPlayer.color,
        lives: newPlayer.lives
    });


    console.log(newPlayer.color);

    this.emit("playerShip", {
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY(),
        color: newPlayer.color
    });

    // Send existing players to the new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", {
            id: existingPlayer.id,
            x: existingPlayer.getX(),
            y: existingPlayer.getY(),
            rotation: existingPlayer.rotation,
            color: existingPlayer.color
        });
    };

    // Add new player to the players array
    players.push(newPlayer);
};

function playerById(id) {
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }
    return;
}


// Player has moved
function onBulletShot(bullet) {
    this.broadcast.emit('bulletShot', {
        x: bullet.x,
        y: bullet.y,
        angle: bullet.angle
    })
};

function onReportHit(data) {
    var player = playerById(data.id);
    if (player) {
        player.lives -= 1;
        if (player.lives < 1) {
          console.log("Dead player! " + this.id);
            // Broadcast removed player to connected socket clients
            this.broadcast.emit("player dead", {
                id: this.id
            });



        }
    }
}

// Player has moved
function onMovePlayer(data) {
    // Find player in array
    var movePlayer = playerById(this.id);

    // Player not found
    if (!movePlayer) {
        return;
    };

    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.rotation = data.rotation;
    // Broadcast updated position to connected socket clients
    this.broadcast.emit("move player", {
        id: movePlayer.id,
        x: movePlayer.getX(),
        y: movePlayer.getY(),
        rotation: movePlayer.rotation
    });
};
