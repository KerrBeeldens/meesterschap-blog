const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pagesDir = path.resolve(__dirname, 'src/pages');
const isDev = process.env.NODE_ENV === 'development';

function findPages(dir, baseDir = dir) {
    const pages = [];

    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            pages.push(...findPages(fullPath, baseDir));
        } else if (entry.name === 'main.js') {
            const relDir = path.relative(baseDir, dir).split(path.sep).join('/');
            pages.push(relDir);
        }
    });

    return pages;
}

const pageNames = findPages(pagesDir);

const entry = {};
const htmlPlugins = [];

pageNames.forEach((name) => {
    entry[name] = path.join(pagesDir, name, 'main.js');

    htmlPlugins.push(
        new HtmlWebpackPlugin({
            filename: name === 'index' ? 'index.html' : `${name}/index.html`,
            template: path.join(pagesDir, name, 'index.html'),
            chunks: [name],
        })
    );
});

module.exports = {
    entry,
    plugins: [
        ...htmlPlugins,
        !isDev && new MiniCssExtractPlugin({ filename: '[name].css' }),
    ].filter(Boolean),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: "eval-source-map",
    devServer: {
        watchFiles: ["./src/pages/**/*.html"],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [isDev ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
};