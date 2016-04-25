
Cowboy = function(state, curs,name, x, y) {
    Player.call(this, state,curs,name, x,y,'cowboy');

    this.animations.add('idle', [0, 1, 2, 3], 10, true);
    this.animations.add('shoot', [4, 5, 6, 7], 10, false);
    this.animations.add('walk', [8, 9, 10, 11], 5, true);    
    this.animations.add('jump', [25], 1, true);
    this.animations.play('idle');
    
    this.aimsprite = game.make.sprite(25,15,'crosshair');
    this.aimsprite.anchor.y = 0.5;
    this.aimsprite.anchor.x = 0.5;
    this.aimsprite.pivot.x = 50;
    this.aimsprite.angle = 180;
    this.addChild(this.aimsprite)
    
    this.body.setSize(21, 35, -4, 5);
    this.anchor.setTo(0.33,0.5);
    this.body.maxVelocity.y = 500;



};

 Cowboy.prototype = Object.create(Player.prototype);
 Cowboy.prototype.constructor = Cowboy;


 Cowboy.prototype.update = function(){
    Player.prototype.update.call(this);
 };
 
 
 Cowboy.prototype.lowerCrosshair = function(){
        if(this.withinRotationArea(this.aimsprite.angle + 2))
        {
            this.aimsprite.angle += 2;
        }
};


Cowboy.prototype.withinRotationArea = function(angle){
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

Cowboy.prototype.raiseCrosshair = function(){
        if(this.withinRotationArea(this.aimsprite.angle - 2))

        {
            this.aimsprite.angle -= 2;
        }
};

Cowboy.prototype.shoot = function(x,y) {
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

Cowboy.prototype.getPointOfImpact = function(ray, object){
    var rayLine = ray.coordinatesOnLine(1);
    for(var i = 0 ; i < rayLine.length; i++){
        if(object.containsPoint(rayLine[i][0], rayLine[i][1]))
        {
            return new Phaser.Point(rayLine[i][0], rayLine[i][1]);
        }
    }
    return new Phaser.Point(-100, -100);
}

Cowboy.prototype.tweenExplosion = function(point){
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
