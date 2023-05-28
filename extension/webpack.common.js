const path = require('path')

module.exports = {
    entry: {
        background: path.join(__dirname, 'src/background.ts'),
        contentScript: path.join(__dirname, 'src/contentScript.ts')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
            // Treat src/css/app.css as a global stylesheet
            {
                test: /\app.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            },
            // Load .module.css files as CSS modules
            {
                test: /\.module.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    },
                    'postcss-loader'
                ]
            }
        ]
    },
    // Setup @src path resolution for TypeScript files
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@src': path.resolve(__dirname, 'src/')
        }
    }
}
