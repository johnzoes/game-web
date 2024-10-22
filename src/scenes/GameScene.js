export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.secrets = []; // Array para almacenar los secretos de los usuarios
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

        // Continuar con el resto de tu código
        this.createInputForm();

        // Inicializar el contenedor de la ruleta
        this.wheelContainer = null;
    }

    createInputForm() {
        // Crear elemento DOM para la entrada de texto
        this.inputElement = this.add.dom(400, 550).createFromHTML(`
            <input type="text" id="secretInput" placeholder="Escribe tu secreto">
            <button id="addSecret">Agregar Secreto</button>
            <button id="spinWheel">Girar Ruleta</button>
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
                    alert('Por favor, agrega al menos un secreto antes de girar la ruleta.');
                }
            }
        });
    }

    addSecret(secret) {
        this.secrets.push(secret);
        // Redibujar la ruleta con los nuevos secretos
        this.drawWheel();
    }

    drawWheel() {
        // Si la ruleta ya existe, eliminarla
        if (this.wheelContainer) {
            this.wheelContainer.destroy();
        }
    
        const radius = 200;
        const numSegments = this.secrets.length;
        const anglePerSegment = Phaser.Math.PI2 / numSegments;
    
        // Crear un nuevo gráfico para la ruleta
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
        // Lista de colores para los segmentos
        const colors = [0xFFD700, 0xFF8C00, 0x8A2BE2, 0x00CED1, 0xADFF2F, 0xFF1493, 0x1E90FF, 0x32CD32];
    
        // Dibujar cada segmento
        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
    
            // Asignar un color diferente a cada segmento
            const color = colors[i % colors.length];
    
            graphics.fillStyle(color, 1);
            // Dibujar el segmento con origen en (radius, radius)
            graphics.slice(radius, radius, radius, startAngle, endAngle, false);
            graphics.fillPath();
        }
    
        // Generar textura a partir del gráfico
        graphics.generateTexture('wheelTexture', radius * 2, radius * 2);
        graphics.destroy();
    
        // Crear un contenedor para la ruleta y los textos
        this.wheelContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
        // Agregar la ruleta al contenedor
        this.wheel = this.add.image(0, 0, 'wheelTexture');
        this.wheel.setOrigin(0.5);
        this.wheelContainer.add(this.wheel);
    
        // Agregar los textos a los segmentos
        for (let i = 0; i < numSegments; i++) {
            const textAngle = (i * anglePerSegment) + (anglePerSegment / 2);
    
            const textX = Math.cos(textAngle - Math.PI / 2) * (radius / 1.5);
            const textY = Math.sin(textAngle - Math.PI / 2) * (radius / 1.5);
    
            const text = this.add.text(textX, textY, this.secrets[i], {
                font: '16px Arial',
                fill: '#000',
                align: 'center',
                wordWrap: { width: radius / 2 }
            });
            text.setOrigin(0.5);
            text.setRotation(textAngle);
    
            // Agregar el texto al contenedor
            this.wheelContainer.add(text);
        }
    }
    
    

    spinWheel() {
        // Deshabilitar la interacción mientras la ruleta gira
        this.inputElement.removeListener('click');
    
        // Calcular el giro aleatorio
        const rounds = Phaser.Math.Between(2, 4); // Número de vueltas completas
        const randomSegment = Phaser.Math.Between(0, this.secrets.length - 1);
        const anglePerSegment = 360 / this.secrets.length;
        const finalAngle = rounds * 360 + randomSegment * anglePerSegment + anglePerSegment / 2;
    
        // Animar el giro
        this.tweens.add({
            targets: this.wheelContainer,
            angle: finalAngle,
            duration: 4000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Calcular el segmento seleccionado
                const selectedIndex = this.secrets.length - 1 - randomSegment;
                // Mostrar el secreto seleccionado
                this.showSelectedSecret(selectedIndex);
                // Volver a habilitar la interacción
                this.inputElement.addListener('click');
            }
        });
    }
    

    showSelectedSecret(index) {
        const selectedSecret = this.secrets[index];
        // Mostrar el secreto en una ventana emergente o en pantalla
        alert(`El secreto seleccionado es:\n\n"${selectedSecret}"`);
    }
}
