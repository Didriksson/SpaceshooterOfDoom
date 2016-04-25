// Create a Phaser game instance
var game = new Phaser.Game(
    1024,
    768,
    Phaser.CANVAS,
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
    game.load.tilemap('platform_tilemap', 'tilemaps/map2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'images/tiles/tiles_spritesheet.png');
    game.load.image('fireball', 'images/items/fireball.png');
    game.load.image('explosion', 'images/explosion.png');
    game.load.spritesheet('cowboy', 'images/cowboy.png', 45, 45, 26);
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

function addPlayer(x, y, name){
    var player = new Cowboy(this,Input.getPlayerOneControls(game),name, x, y);
    players.push(player);
    if(players.length == 1)
    {
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORM);
        game.camera.setSize(1024,768);
    }
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
    var name = prompt("Enter player name: ", "Player 1");
    addPlayer(200,200, name);
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
        if(players && true == true){
            players.forEach(function (player){
                game.debug.bodyInfo(player, 32, 32);
                game.debug.body(player);
            });
        }
        
        //console.log(game.time.fps || '--');   
     }
