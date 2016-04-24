// Create a Phaser game instance
var game = new Phaser.Game(
    1024,
    768,
    Phaser.AUTO,
    'container', {
        preload: preload,
        create: create,
        update: update,
        init: init,
        render: render
    }
);

var players = [];
var cowboy;
var socket;
var cursors;
var groundLayer;
var mouseSprite;
var fireRate = 250;
var nextFire = 0;

// Preload assets
function preload() {
    game.load.spritesheet('cowboy', 'images/cowboy.png', 90, 90, 26);
    game.load.tilemap('platform_tilemap', 'tilemaps/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'images/tiles/tiles_spritesheet.png');
    game.load.image('fireball', 'images/items/fireball.png');
    game.load.image('explosion', 'images/explosion.png');
    game.load.image('crosshair', 'images/hud/crosshair_red_small.png');
    game.time.advancedTiming = true;

}

// Init
function init() {
    game.stage.disableVisibilityChange = true;
}

// Socket connected
function onSocketConnected() {
    console.log("Connected to socket server");
    // Send local player data to the game server
    socket.emit("new player");
}


function playerById(id) {
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    }
    return;
}

function addPlayer(x, y){
    var player = new Player(this, 10, 0, 'cowboy');
    players.push(player);
}


// Assets are available in create
function create() {
    socket = io();
    // Socket connection successful
    socket.on("connect", onSocketConnected);
    game.stage.backgroundColor = "#a9f0ff";
    game.world.setBounds(0, 0, 1500, 1500);
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 1200;

    
    map = game.add.tilemap('platform_tilemap');
    map.addTilesetImage('tiles_spritesheet', 'tiles');
    groundLayer = map.createLayer('platformLayer');
    groundLayer.resizeWorld();
    map.setCollisionByExclusion([0],true, 'platformLayer');

   // addPlayer(10,0);
}


// Update
function update() {
    handleCollisions();
}




function handleCollisions(){
    players.forEach(function (player){
      game.physics.arcade.collide(player, groundLayer); 
    });
}
// Render some debug text on screen
function render() {
        if(players && true == false){
            players.forEach(function (player){
            game.debug.spriteInfo(player.aimsprite, 32, 32);
            game.debug.body(player);
            game.debug.body(player.aimsprite);

            });
        }
        
        game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   
     }
