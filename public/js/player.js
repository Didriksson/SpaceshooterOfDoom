var bmd;
var shipSprite;
var lives = 3;

Player = function(game, color, x, y) {
    var id;
    this.heartsprites = [];
    this.game = game;

    this.shipSprite = game.add.sprite(x, y, 'ship');

    for (var i = 0; i < 3; i++) {
        this.heartsprites[i] = game.add.sprite(30 + 30 * i, 30, 'heart');
        this.heartsprites[i].fixedToCamera = true;
        this.heartsprites[i].scale.setTo(2, 2);
        this.heartsprites[i].visible = false;
    }

    this.shipSprite.tint = color;
    this.game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);

    this.shipSprite.anchor.set(0.5);
    this.shipSprite.body.drag.set(250);
    this.shipSprite.body.collideWorldBounds = true;
    this.shipSprite.animations.add('fly', [1, 2], 10, false);
    this.shipSprite.animations.add('standstill', [0], 1, false);
    this.shipSprite.animations.play('standstill');
};

Player.prototype.steerLeft = function() {
    this.shipSprite.body.angularVelocity = -300;
};

Player.prototype.steerRight = function() {
    this.shipSprite.body.angularVelocity = 300;
};

Player.prototype.moveForward = function() {
    this.shipSprite.body.velocity.copyFrom(this.game.physics.arcade.velocityFromAngle(this.shipSprite.angle, 300));
    if (this.shipSprite.animations.currentAnim.name != 'fly' && this.lives > 0) {
        this.shipSprite.animations.play('fly');
    }
};

Player.prototype.hit = function() {
    lives -= 1;
    if (lives <= 0) {
      this.shipSprite.body.enable = false;
      console.log('I cant move!');
    }
};

Player.prototype.updateHearts = function() {
    for (var i = 0; i < 3; i++) {
        if (i < lives)
            this.heartsprites[i].visible = true;
        else {
            this.heartsprites[i].visible = false;
        }
    }
}

Player.prototype.standstill = function() {
    this.shipSprite.animations.play('standstill');
};

Player.prototype.update = function() {
    this.shipSprite.body.angularVelocity = 0;
    this.shipSprite.body.velocity.x = game.math.roundTo(this.shipSprite.body.velocity.x * 0.8, 0);
    this.shipSprite.body.velocity.y = game.math.roundTo(this.shipSprite.body.velocity.y * 0.8, 0);
};
