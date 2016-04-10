// Create a Phaser game instance
var game = new Phaser.Game(
    640,
    480,
    Phaser.AUTO,
    'container', {
        preload: preload,
        create: create,
        update: update,
        init: init,
        render: render
    }
);

var player;
var remotePlayers = [];
var shootSound;
var fireRate = 100;
var nextFire = 0;
var bullets;

var enemy;
var socket;
var itemsToCollideWith = [];
// Preload assets
function preload() {
    game.load.audio('backgroundMusic', 'sounds/bgm/bgm.mp3');
    game.load.image('background', 'images/background.png');
    game.load.image('arrow', 'images/arrow.png');
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('heart', 'images/heart.png');
    game.load.spritesheet('explosion', 'images/explosion.png', 16, 16);
    game.load.spritesheet('ship', 'images/ship.png', 23, 32);
    game.load.spritesheet('fire', 'images/fire.png', 32, 32);
    game.load.audio('laserSound', 'sounds/lasers/1.wav');
    game.load.audio('explosionSound', 'sounds/explosions/1.wav');
}

// Init
function init() {
    game.stage.disableVisibilityChange = true;
}

function onPlayerShipFromServer(ship) {
    console.log('Received player object from server with id: ' + ship.id);
    player = new Player(game, ship.color, ship.x, ship.y);
    player.updateHearts();
    player.id = ship.id;
    game.camera.follow(player.shipSprite, Phaser.Camera.FOLLOW_LOCKON);

    arrowToEnemy = game.add.sprite(player.shipSprite.x, player.shipSprite.y, 'arrow');
    arrowToEnemy.anchor.x = 0.5;
    arrowToEnemy.anchor.y = 0.5;
}

// Socket connected
function onSocketConnected() {
    console.log("Connected to socket server");
    // Send local player data to the game server
    socket.emit("new player");
};

function onReportedHit(object) {
    console.log('Reported hit on enemy ' + object.id);
    var playerThatWasHit = playerById(object.id);
    if (playerThatWasHit)
        playerThatWasHit.hit();
};

function onBulletShot(bullet) {
    spawnBullet(bullet.x, bullet.y, bullet.angle);
};

function displayHitEffect() {
    tweenTint(background, 0xff0000, 0xFFFFFF, 500); // tween the tint of sprite from red to blue over 2 seconds (2000ms)
}

function tweenTint(obj, startColor, endColor, time) {
    // create an object to tween with our step value at 0
    var colorBlend = {
        step: 0
    };
    // create the tween on this object and tween its step property to 100
    var colorTween = game.add.tween(colorBlend).to({
        step: 100
    }, time);
    // run the interpolateColor function every time the tween updates, feeding it the
    // updated value of our tween each time, and set the result as our tint
    colorTween.onUpdateCallback(function() {
        obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
    });
    // set the object to the start color straight away
    obj.tint = startColor;
    colorTween.start();
}


// Socket connected
function onNewPlayer(data) {
    console.log("New player connected");
    var newPlayer = new Player(game, data.color, data.x, data.y);
    newPlayer.id = data.id;
    remotePlayers.push(newPlayer);
};

function onRemovePlayer(data) {
    var playerThatleft = playerById(data.id);
    if (playerThatleft) {
        remotePlayers.splice(remotePlayers.indexOf(playerThatleft), 1);
        playerThatleft.shipSprite.kill();
        console.log('Player ' + data.id + 'left');
    } else {
        console.log('Could not find player to remove ' + data.id);
    }



}

// Remote player has moved
function onMovePlayer(data) {
    // Find player in array
    var movePlayer = playerById(data.id);

    // Player not found
    if (!movePlayer) {
        return;
    };

    // Update player position
    movePlayer.shipSprite.x = data.x;
    movePlayer.shipSprite.y = data.y;
    movePlayer.shipSprite.rotation = data.rotation;
};

function playerById(id) {
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    }
    return;
};

// Assets are available in create
function create() {
    socket = io();
    // Socket connection successful
    socket.on("connect", onSocketConnected);

    socket.on("new player", onNewPlayer);

    socket.on("move player", onMovePlayer);

    socket.on("remove player", onRemovePlayer);

    socket.on("player dead", onRemovePlayer);

    socket.on("bulletShot", onBulletShot);

    socket.on('playerShip', onPlayerShipFromServer);

    socket.on('reportedHit', onReportedHit);

    background = game.add.sprite(0, 0, 'background');

    game.world.setBounds(0, 0, 1500, 1500);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    shootSound = game.add.audio('laserSound');
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);


    backgroundMusic = game.add.audio('backgroundMusic');
    backgroundMusic.loopFull(0.5);
    explosionpool = this.game.add.group();
    explosionpool.createMultiple(30, 'explosion');
    explosionpool.forEach(setUpExplosion, this);
    explosionSound = game.add.audio('explosionSound');

    this.cursors = game.input.keyboard.createCursorKeys();
    this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function setUpExplosion(explosion) {
    explosion.anchor.x = 0.5;
    explosion.anchor.y = 0.5;
    explosion.scale.x = 2;
    explosion.scale.y = 2;
    explosion.animations.add('boom');
}

// Update
function update() {
    if (player) {
        for (i = 0; i < remotePlayers.length; i++) {
            var enemy = remotePlayers[i];
            game.physics.arcade.overlap(bullets, enemy.shipSprite, objectHit, null, this)
        }

        if (game.physics.arcade.overlap(bullets, player.shipSprite, objectHit, null, this)) {
            player.hit();
            player.updateHearts();
            displayHitEffect();
            reportHit(player);
            if(lives <= 0){
                addFireEffect(player.shipSprite.x, player.shipSprite.y);
              }
        }

        player.update();

        if (this.cursors.up.isDown) {
            player.moveForward();
        } else {
            player.standstill();
        }

        if (this.cursors.left.isDown) {
            player.steerLeft();
        } else if (this.cursors.right.isDown) {
            player.steerRight();
        }

        if (this.fireButton.isDown) {
            shoot();
        }

        updateServer();
        updateArrowToEnemy();
    }
}

function shoot() {
    if (game.time.now > nextFire) {
        nextFire = game.time.now + fireRate;
        spawnBullet(player.shipSprite.x, player.shipSprite.y, player.shipSprite.angle);
        shootSound.play();
        socket.emit('bulletShot', {
            x: bullet.x,
            y: bullet.y,
            angle: bullet.angle
        })
    }
};

function spawnBullet(x, y, angle) {
    bullet = bullets.getFirstExists(false);
    if (bullet) {
        var p1 = new Phaser.Point(x, y);
        Phaser.Point.rotate(p1, p1.x, p1.y, angle, true, 25);
        bullet.reset(p1.x, p1.y);
        bullet.angle = angle;
        bullet.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(angle, 600));
    }
};

function updateServer() {
    if (player) {
        socket.emit("move player", {
            x: player.shipSprite.x,
            y: player.shipSprite.y,
            rotation: player.shipSprite.rotation,
            id: player.id
        });
    }
}

function updateArrowToEnemy(enemy) {
    if (enemy) {
        arrowToEnemy.rotation = game.physics.arcade.angleBetween(player.shipSprite, enemy.shipSprite);
        arrowToEnemy.x = player.shipSprite.x;
        arrowToEnemy.y = player.shipSprite.y;
    } else {
        arrowToEnemy.x = -1000;
        arrowToEnemy.y = -1000;
    }
}


function reportHit(object) {
    socket.emit('report hit', {
        id: object.id
    });
}

function objectHit(tank, bullet) {
    bullet.kill();
    explosionSound.play();
    explo = explosionpool.getFirstExists(false);
    explo.reset(bullet.x, bullet.y);
    explo.play('boom', 10, false, true);
};

function addFireEffect(x, y){
  fire = game.add.sprite(x, y, 'fire');
  fire.anchor.setTo(0.5, 0.7);
  fire.animations.add('fireaway');
  fire.animations.play('fireaway', 10,true, false);
}

// Render some debug text on screen
function render() {}
