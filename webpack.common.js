const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Production',
            template: "./src/template.html",
        }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: "eval-source-map",
    devServer: {
        watchFiles: ["./src/template.html"],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            // Loading images using src attribute in HTML
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            // Loading images using JS
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            // Loading fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],

    },
};