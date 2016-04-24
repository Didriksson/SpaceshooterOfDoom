var bmd;
var shipSprite;
var lives = 3;
var sprite;
var doubleJumpAvailable = true;
var lastJump;
var aimsprite;
var state;

Player = function(state, x, y, spriteName) {
    var id;
    this.game = state.game;
    Phaser.Sprite.call(this, game, x,y, spriteName);
    game.physics.enable(this);
    this.aimsprite = game.make.sprite(25,15,'crosshair');
    game.physics.enable(this.aimsprite);
    this.aimsprite.anchor.y = 0.5;
    this.aimsprite.anchor.x = 0.5;
    this.aimsprite.pivot.x = 100;
    this.aimsprite.angle = 180;
    this.aimsprite.body.moves = false;
    this.body.setSize(42, 70, -8, 10);
    this.anchor.setTo(0.33,0.5);
    this.addChild(this.aimsprite)
    this.body.collideWorldBounds = true;
    this.body.maxVelocity.y = 500;
    this.animations.add('idle', [0, 1, 2, 3], 10, true);
    this.animations.add('shoot', [4, 5, 6, 7], 10, false);
    this.animations.add('walk', [8, 9, 10, 11], 5, true);    
    this.animations.add('jump', [25], 1, true);
    this.animations.play('idle');
    game.add.existing(this);
    game.camera.follow(this, Phaser.Camera.FOLLOW_LOCKON);
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

};

 Player.prototype = Object.create(Phaser.Sprite.prototype);
 Player.prototype.constructor = Player;

Player.prototype.moveLeft = function() {

    if(this.scale.x == 1){
        this.scale.x = -1;
       // this.aimsprite.angle = 180 - this.aimsprite.angle;
    }
    
    
    this.body.velocity.x = -300;
    this.animations.play('walk');  //now play the animation named "walk"
};

Player.prototype.moveRight = function() {

    if(this.scale.x == -1){
        this.scale.x = 1;
    }
    this.body.velocity.x = 300;
    this.animations.play('walk');  //now play the animation named "walk"
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

Player.prototype.lowerCrosshair = function(){
        if(this.withinRotationArea(this.aimsprite.angle + 2))
        {
            this.aimsprite.angle += 2;
        }
};


Player.prototype.withinRotationArea = function(angle){
    if(angle > 20 && angle < 140)
    {
        return false;    
    }
    
    else if(angle > -140 && angle < -20){
        return false;
    }
    
    else{
        return true;
    }
    
    
}

Player.prototype.raiseCrosshair = function(){
        if(this.withinRotationArea(this.aimsprite.angle - 2))

        {
            this.aimsprite.angle -= 2;
        }
};

Player.prototype.shoot = function(x,y) {
    this.animations.play('shoot');
    var ray = new Phaser.Line();
    var p1 = new Phaser.Point(x,y);
    ray.fromAngle(x, y, game.physics.arcade.angleBetween(p1, this.aimsprite.world), 750);
    var hits = groundLayer.getRayCastTiles(ray, 4, true,true);
    if(hits.length > 0){
        var shortestCoordinate = new Phaser.Point(-100, -100);
        var distanceToPoint = 100000;
        for(var i = 0; i<hits.length;i++){
            var poi =  this.getPointOfImpact(ray, hits[i]);
            var distance = game.math.distance(poi.x, poi.y, x,y);     
            if(distance < distanceToPoint){
                shortestCoordinate = poi;
                distanceToPoint = distance;
            }
        }
        this.tweenExplosion(shortestCoordinate);
    }

};

Player.prototype.getPointOfImpact = function(ray, object){
    var rayLine = ray.coordinatesOnLine(1);
    for(var i = 0 ; i < rayLine.length; i++){
        if(object.containsPoint(rayLine[i][0], rayLine[i][1]))
        {
            return new Phaser.Point(rayLine[i][0], rayLine[i][1]);
        }
    }
    return new Phaser.Point(-100, -100);
}

Player.prototype.tweenExplosion = function(point){
        var explosion = game.add.sprite(point.x, point.y, 'explosion');
        explosion.scale.setTo(0.5);
        explosion.anchor.setTo(0.5);
        var killTween = game.add.tween(explosion.scale);
        killTween.to({x:0,y:0}, 500, Phaser.Easing.Linear.None);
        killTween.onComplete.addOnce(function(){
            explosion.kill();
        }, this);
        killTween.start();

}




Player.prototype.update = function() {
    this.body.velocity.x = 0;
         if (cursors.left.isDown)
    {
    	this.moveLeft();
    }
    else if (cursors.right.isDown)
    {
    	this.moveRight();    }

    if (cursors.up.isDown)
    {
        this.raiseCrosshair();
    }
    else if (cursors.down.isDown)
    {
        this.lowerCrosshair();
    }
    
    if(fireButton.isDown &&  game.time.now > nextFire) {
        nextFire = game.time.now + fireRate;
        if(this.scale.x == 1){
            this.shoot(this.x + this.aimsprite.x, this.y + this.aimsprite.y);        
        }    
        else{
            this.shoot(this.x - this.aimsprite.x, this.y + this.aimsprite.y);
        }
        
    }
    
    if(jumpButton.isDown){
    	this.jump();
    }
};