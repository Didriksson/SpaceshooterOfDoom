var doubleJumpAvailable = true;
var lastJump;
var aimsprite;
var state;
var cursors;
var name;

Player = function(state, curs, playername, x, y, spriteName) {
    this.game = state.game;
    Phaser.Sprite.call(this, game, x,y, spriteName);
    game.physics.enable(this);
    this.body.collideWorldBounds = true;
    game.add.existing(this);
    cursors = curs;
    this.name = playername;
    var style = { font: "bold 18px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle" };
    this.text = game.make.text(0, 0, playername, style);
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 1.5;
    this.addChild(this.text);
};


 Player.prototype = Object.create(Phaser.Sprite.prototype);
 Player.prototype.constructor = Player;


Player.prototype.moveLeft = function() {

    if(this.scale.x == 1){
        this.scale.x = -1;
        this.text.scale.x = -1;
    }
    
    
    this.body.velocity.x = -300;
    if(this.body.blocked.down)
        this.animations.play('walk');
};

Player.prototype.moveRight = function() {

    if(this.scale.x == -1){
        this.scale.x = 1;
        this.text.scale.x = 1;
    }
    this.body.velocity.x = 300;
    if(this.body.blocked.down)
        this.animations.play('walk');
};

Player.prototype.jump = function() {
    if(this.body.blocked.down){
        this.lastJump = this.game.time.now;
        this.doubleJumpAvailable = true;
        this.body.velocity.y = -800;
        this.animations.play('jump');

    }
    else if(this.doubleJumpAvailable && this.game.time.now > this.lastJump + 150)
    {
        this.doubleJumpAvailable = false;
        this.body.velocity.y = -800;
        this.animations.play('jump');
}
};


Player.prototype.update = function() {
    this.body.velocity.x = 0;
     if (cursors.left.isDown)
    {
    	this.moveLeft();
    }
    else if (cursors.right.isDown)
    {
    	this.moveRight(); 
    }
    else{
        if(this.body.blocked.down)
            this.animations.play('idle');
    }
   if (cursors.up.isDown)
    {
        this.raiseCrosshair();
    }
    else if (cursors.down.isDown)
    {
        this.lowerCrosshair();
    }
    
    if(cursors.shoot.isDown &&  game.time.now > nextFire) {
        nextFire = game.time.now + fireRate;
        if(this.scale.x == 1){
            this.shoot(this.x + this.aimsprite.x, this.y + this.aimsprite.y);        
        }    
        else{
            this.shoot(this.x - this.aimsprite.x, this.y + this.aimsprite.y);
        }
        
    }
    
    if(cursors.jump.isDown){
    	this.jump();
    }
};