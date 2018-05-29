// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // Load the images and sounds 
        game.load.image('bg','assets/bg.jpg')

        game.load.image('knight', 'assets/knight.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('coin', 'assets/coin.png');
        
        game.load.audio('jump', 'assets/jump.wav'); 
        game.load.audio('coin', 'assets/coin.wav'); 
        
        game.load.audio('bgm', 'assets/BGM.mp3');

        
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.
        
        // Add background image
        this.tileSprite = game.add.tileSprite(0, 0, 400, 600, 'bg' );
        
        // Add background music
        bgm = game.add.audio('bgm',0.5,true);
        bgm.play();
        
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the knight at the position x=100 and y=245
        this.knight = game.add.sprite(100, 245, 'knight');

        // Add physics to the knight. Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.knight);

        // Add gravity to the knight
        this.knight.body.gravity.y = 900;  

        // spacekey is hit => jump()
        var spaceKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        this.jumpSound = game.add.audio('jump'); //add sound for 'jump'
        this.coinSound = game.add.audio('coin'); //add sound for 'coin'

        // Create an empty group
        this.walls = game.add.group(); 
        this.coins = game.add.group(); 

        this.timer = game.time.events.loop(1600, this.addRowOfCoins, this);
        this.timer = game.time.events.loop(1600, this.addRowOfwalls, this);
        
        //Creat score, highscore, credit
        var highscore, highscoreText;
        this.score = 0;
        this.labelScore = game.add.text(20, 40, "0", 
            { font: "bold 24px Arial", fill: "#ffffff" });  

        highScoreText = this.game.add.text(10, 10,
        'High Score: ' + highscore,
        { font: "12px Arial", fill: "#ffffff", align: "center" });

        var credit = this.game.add.text(24, 570,
            'Spacebar = Jump                                    Jump Knight © Phan Đức Anh ' ,
            { font: "11px Arial", fill: "#ffffff", align: "center" })

        // move the anchor to the left and downward
        this.knight.anchor.setTo(-0.2, 0.5); 

    },

    render: function() {
        game.debug.text('walls: z = 2');
        game.debug.text('knight: z = 0');
        game.debug.text('coins: z = 1');  
    },    
   

    update: function() {
        // this function is called 60 times/s. It contains the game's logic
        // knight is out of the screen (too high or too low) => the restartGame(). 
        
        if (this.knight.y < 0 || this.knight.y > 500)
        this.restartGame();   

        game.physics.arcade.overlap(
            this.knight, this.walls, this.restartGame, null, this);

        if (this.knight.angle < 24)
        this.knight.angle += 1; 

        game.physics.arcade.overlap(
            this.knight, this.walls, this.hitwall, null, this);

        // knight takes a coin => takeCoin()
        game.physics.arcade.overlap(this.knight, this.coins, this.takeCoin, null, this);

        //Highscore code
        highScoreText.text='High Score: '+localStorage.getItem("currenthighscore");
        if (this.score > localStorage.getItem("currenthighscore"))
            {localStorage.setItem("currenthighscore",this.score );}

    },

    // the jump of knight
    jump: function() {
        // Add a vertical velocity to the knight
        this.knight.body.velocity.y = -360;

        // Create an animation on the knight
        var animation = game.add.tween(this.knight);

        // Change the angle of the knight to -18° in 120 milliseconds
        animation.to({angle: -18}, 120);

        // And start the animation
        animation.start(); 

        //game.add.tween(this.knight).to({angle: -18}, 120).start(); 

        this.jumpSound.play(); 
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
        bgm.stop(); //stop the background music
        
    },

    addCoin: function(x, y) {
        // Create a coin at the position x and y
        var coin = game.add.sprite(x, y, 'coin');
        
        // Add the coin to our previously created group
        this.coins.add(coin);
        
        // Enable physics on the coin 
        game.physics.arcade.enable(coin);
        
        // Add velocity to the coin to make it move left
        coin.body.velocity.x = -100; 
        
        // Automatically kill the coin when it's no longer visible 
        coin.checkWorldBounds = true;
        coin.outOfBoundsKill = true;
        },
    
    addRowOfCoins: function() {
        var hole2 = Math.floor(Math.random() * 5) + 1;
        
           for (var i = 0; i < 12; i++)
                if (i != hole2 && i != hole2 + 2 && i != hole2 + 4  && i != hole2 + 6 && i != hole2 + 8 ) 
                    this.addCoin(350, i * 60 + 10); 
                    
            //this.score += 1;
            //this.labelScore.text = this.score;  
        },
    
    // Function to kill a coin
    takeCoin: function(knight, coin) {
        coin.kill();
        this.score += 1;
        this.labelScore.text = this.score;
        this.coinSound.play(); 
        },

    addOnewall: function(x, y) {
        // Create a wall at the position x and y
        var wall = game.add.sprite(x, y, 'wall');
    
        // Add the wall to our previously created group
        this.walls.add(wall);
    
        // Enable physics on the wall 
        game.physics.arcade.enable(wall);
    
        // Add velocity to the wall to make it move left
        wall.body.velocity.x = -200; 
    
        // Automatically kill the wall when it's no longer visible 
        wall.checkWorldBounds = true;
        wall.outOfBoundsKill = true;
    },

    addRowOfwalls: function() {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;
    
        // Add the 6 walls 
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 12; i++)
            if (i != hole && i != hole + 1) 
                this.addOnewall(400, i * 60 + 10); 
                
        this.score += 10;
        this.labelScore.text = this.score;  
    },

    hitWall: function() {
        // If the knight has already hit a knight, do nothing
        // It means the knight is already falling off the screen
        if (this.knight.alive == false)
            return;
    
        // Set the alive property of the knight to false
        this.knight.alive = false;
    
        // Prevent new walls from appearing
        game.time.events.remove(this.timer);
    
        // Go through all the walls, and stop their movement
        this.walls.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);   
    }, 

    
};

// Initialize Phaser, and create a 400px by 600px game
var game = new Phaser.Game(400, 600);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');
