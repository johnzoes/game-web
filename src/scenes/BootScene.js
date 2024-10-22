import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.video('backgroundVideo', 'assets/videos/background-game.mp4', 'loadeddata', false, true);
    }

    create() {
        // Iniciar la siguiente escena
        this.scene.start('GameScene');
    }
}
