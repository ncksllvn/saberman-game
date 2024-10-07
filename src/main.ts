import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types, Scale, AUTO } from "phaser";

let platforms: Phaser.Physics.Arcade.StaticGroup;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let stars: Phaser.Physics.Arcade.Group;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let bombs: Phaser.Physics.Arcade.Group;
let gameOver = false;

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    title: 'Saberman',
    type: AUTO, // rendering context
    width: 800,
    height: 600,
    zoom: 2,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    // scene: [
    //     Boot,
    //     Preloader,
    //     MainMenu,
    //     MainGame,
    //     GameOver
    // ]
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300, },
            debug: false
        }
    },
    scene: {
        preload() {
            this.load.image('sky', 'assets/sky.png');
            this.load.image('ground', 'assets/platform.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.spritesheet('saberman', 'assets/saberman.png', { frameWidth: 32, frameHeight: 48 });
        },
        create() {
            cursors = this.input!.keyboard!.createCursorKeys();

            this.add.image(400, 300, 'sky');

            platforms = this.physics.add.staticGroup();

            platforms.create(400, 568, 'ground').setScale(2).refreshBody();

            platforms.create(600, 400, 'ground');
            platforms.create(50, 250, 'ground');
            platforms.create(750, 220, 'ground');

            player = this.physics.add.sprite(100, 450, 'saberman');

            player.setBounce(0.2);
            player.setCollideWorldBounds(true);

            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('saberman', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'turn',
                frames: [ { key: 'saberman', frame: 4 } ],
                frameRate: 20
            });

            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('saberman', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });

            this.physics.add.collider(player, platforms);

            stars = this.physics.add.group({
                key: 'star',
                repeat: 11,
                setXY: { x: 12, y: 0, stepX: 70 }
            });

            stars.children.iterate((child) => {
                const star = child as Phaser.Physics.Arcade.Sprite;
                star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                return true;
            });

            this.physics.add.collider(stars, platforms);
            this.physics.add.overlap(player, stars, (_player, star) => {
                star.disableBody(true, true);
                score += 10;
                scoreText.setText('Score: ' + score);

                if (stars.countActive(true) === 0)
                {
                    stars.children.iterate((child) => {
                        child.enableBody(true, child.x, 0, true, true);
                    });

                    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                    var bomb = bombs.create(x, 16, 'bomb');
                    bomb.setBounce(1);
                    bomb.setCollideWorldBounds(true);
                    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                }
            }, undefined, this);

            scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

            bombs = this.physics.add.group();

            this.physics.add.collider(bombs, platforms);
            this.physics.add.collider(player, bombs, (_play, bomb) => {
                this.physics.pause();

                player.setTint(0xff0000);

                player.anims.play('turn');

                gameOver = true;
            }, undefined, this);
        },
        update() {
            if (gameOver)
            {
                return;
            }

            if (cursors.left.isDown)
            {
                player.setVelocityX(-160);

                player.anims.play('left', true);
            }
            else if (cursors.right.isDown)
            {
                player.setVelocityX(160);

                player.anims.play('right', true);
            }
            else
            {
                player.setVelocityX(0);

                player.anims.play('turn');
            }

            if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down)
            {
                player.setVelocityY(-400);
            }

            if (cursors.down.isDown && !player.body.touching.down) {
                player.setVelocityY(300)
            }
        }
    }
};

export default new Game(config);
