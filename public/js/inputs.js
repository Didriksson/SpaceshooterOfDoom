Input = function (){};

Input.getPlayerOneControls = function(game){
      var cursors = {                
        up: game.input.keyboard.addKey(Phaser.Keyboard.UP),               
        down: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),                
        left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),                
        right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),            
        shoot: game.input.keyboard.addKey(Phaser.Keyboard.CONTROL),
        jump: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
    };
    
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.LEFT);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.RIGHT);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.CONTROL);
    
    
    return cursors;    
};