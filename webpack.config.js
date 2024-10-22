const path = require('path');

module.exports = {
    entry: './src/main.js', // Punto de entrada de tu aplicación
    output: {
        filename: 'bundle.js', // Nombre del archivo de salida
        path: path.resolve(__dirname, 'public') // Directorio de salida
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public') // Directorio para servir archivos estáticos
        },
        compress: true,
        port: 9000 // Puerto del servidor de desarrollo
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Aplicar esta regla a archivos .js
                include: path.resolve(__dirname, 'src/'),
                use: {
                    loader: 'babel-loader', // Usar Babel para transpilar
                    options: {
                        presets: ['@babel/preset-env'] // Presets de Babel
                    }
                }
            }
        ]
    }
};
