export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.secrets = []; // Array para almacenar los secretos de los usuarios
        this.texts = []; // Array para almacenar los textos de los segmentos
    }

    create() {
        // Agregar el video de fondo
        const backgroundVideo = this.add.video(this.cameras.main.width / 2, this.cameras.main.height / 2, 'backgroundVideo');

        // Ajustar el tamaño del video al tamaño del juego
        backgroundVideo.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Reproducir el video en bucle
        backgroundVideo.play(true);

        // Ajustar la profundidad para que el video esté detrás de otros elementos
        backgroundVideo.setDepth(-1);

        // Crear ruleta y puntero
        this.createWheel();
        this.createPointer();

        // Crear entrada de texto y botón para agregar secretos
        this.createInputForm();
    }

    createInputForm() {
        // Crear elemento DOM para la entrada de texto
        this.inputElement = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height - 100).createFromHTML(`
            <div style="text-align: center;">
                <input type="text" id="secretInput" placeholder="Escribe tu secreto" style="padding: 10px; width: 300px; border-radius: 5px; border: 1px solid #ccc;">
                <button id="addSecret" style="padding: 10px; margin-left: 5px; border-radius: 5px; background-color: #4CAF50; color: white;">Agregar Secreto</button>
                <button id="spinWheel" style="padding: 10px; margin-left: 5px; border-radius: 5px; background-color: #008CBA; color: white;">Girar Ruleta</button>
            </div>
        `);

        // Agregar eventos a los botones
        this.inputElement.addListener('click');
        this.inputElement.on('click', (event) => {
            if (event.target.id === 'addSecret') {
                const input = document.getElementById('secretInput');
                const secret = input.value.trim();
                if (secret) {
                    this.addSecret(secret);
                    input.value = '';
                }
            } else if (event.target.id === 'spinWheel') {
                if (this.secrets.length > 0) {
                    this.spinWheel();
                } else {
                    this.showMessage('Por favor, agrega al menos un secreto antes de girar la ruleta.');
                }
            }
        });
    }

    createWheel() {
        // Crear ruleta con segmentos dinámicos
        this.radius = 200;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.wheelContainer = this.add.container(centerX, centerY);
        this.wheelGraphics = this.add.graphics();
        this.wheelContainer.add(this.wheelGraphics);
        this.updateWheel();
    }

    createPointer() {
        // Crear puntero fijo en la parte superior
        const pointerX = this.cameras.main.width / 2;
        const pointerY = this.cameras.main.height / 2 - 220;
        this.pointer = this.add.triangle(pointerX, pointerY, 0, 50, -25, -25, 25, -25, 0xff0000).setOrigin(0.5);
    }

    addSecret(secret) {
        this.secrets.push(secret);
        this.updateWheel();
    }

    updateWheel() {
        // Limpiar el gráfico previo y los textos
        this.wheelGraphics.clear();
        this.texts.forEach(text => text.destroy());
        this.texts = [];

        const numSegments = this.secrets.length;
        const anglePerSegment = Phaser.Math.PI2 / numSegments;
        const colors = [0xFFD700, 0xFF8C00, 0x8A2BE2, 0x00CED1, 0xADFF2F, 0xFF1493, 0x1E90FF, 0x32CD32];

        // Dibujar cada segmento de la ruleta
        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
            const color = colors[i % colors.length];

            this.wheelGraphics.fillStyle(color, 1);
            this.wheelGraphics.slice(0, 0, this.radius, startAngle, endAngle, false);
            this.wheelGraphics.fillPath();
        }

        // Dibujar los textos
        for (let i = 0; i < numSegments; i++) {
            const textAngle = (i * anglePerSegment) + (anglePerSegment / 2);
            const textX = Math.cos(textAngle - Math.PI / 2) * (this.radius * 0.7);
            const textY = Math.sin(textAngle - Math.PI / 2) * (this.radius * 0.7);

            const text = this.add.text(0, 0, this.secrets[i], {
                font: '16px Arial',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            text.setPosition(textX, textY);
            text.setRotation(textAngle);
            this.wheelContainer.add(text);
            this.texts.push(text);
        }
    }

    spinWheel() {
        // Deshabilitar la interacción mientras la ruleta gira
        this.inputElement.removeListener('click');

        const rounds = Phaser.Math.Between(2, 4); // Número de vueltas completas
        const randomSegment = Phaser.Math.Between(0, this.secrets.length - 1);
        const anglePerSegment = 360 / this.secrets.length;
        const finalAngle = rounds * 360 + randomSegment * anglePerSegment;

        // Animar el giro de la ruleta
        this.tweens.add({
            targets: this.wheelContainer,
            angle: finalAngle,
            duration: 4000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Mostrar el secreto seleccionado con animación de explosión
                this.animateExplosion(randomSegment);
                // Volver a habilitar la interacción
                this.inputElement.addListener('click');
            }
        });
    }

    animateExplosion(index) {
        // Crear animación de explosión para el segmento seleccionado
        const selectedSecret = this.secrets[index];
        const emitter = this.add.particles(0, 0, 'spark', {
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            speed: { min: -200, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD'
        });

        // Mostrar el secreto después de la explosión y detener el emisor de partículas
        this.time.delayedCall(1000, () => {
            emitter.stop();
            this.showMessage(`El secreto seleccionado es: "${selectedSecret}"`);
        });
    }

    showMessage(message) {
        // Crear un cuadro de diálogo para mostrar el mensaje
        const messageBox = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height / 2).createFromHTML(`
            <div style="background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 10px; width: 300px; text-align: center;">
                <p>${message}</p>
                <button id="closeMessage" style="padding: 10px; border-radius: 5px; background-color: #f44336; color: white;">Cerrar</button>
            </div>
        `);

        messageBox.addListener('click');
        messageBox.on('click', (event) => {
            if (event.target.id === 'closeMessage') {
                messageBox.destroy();
            }
        });
    }
}