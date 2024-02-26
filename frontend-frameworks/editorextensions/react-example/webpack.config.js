const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const reactTargets = [{name: 'react-example', port: 3000}];

module.exports = {
    entry: './src/extension.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /[\\\/]resources[\\\/]/,
                use: 'raw-loader',
                exclude: /\.json$/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bin/extension.js',
        path: __dirname,
    },
    plugins: [
        new WebpackShellPluginNext({
            //When doing a watch build, run "npm start" and update the html file to prefix http://localhost:3000/ to all the resource URLs
            onWatchRun: {
                scripts: reactTargets.map(
                    (target) =>
                        `mkdir -p ../../public/${target.name} &&` +
                        `curl http://localhost:${target.port} | ` +
                        `sed -E "s/(src|href)=\\"/\\\\1=\\"http:\\/\\/localhost:${target.port}\/gi" > ` +
                        `../../public/${target.name}/index.html`,
                ),
                blocking: true,
            },
            // When doing a full build, run "npm run build" and then copy all the assets to the root level public folder
            onBeforeNormalRun: {
                scripts: reactTargets.map(
                    (target) =>
                        `mkdir -p ../../public/${target.name} &&` +
                        `cd ${target.name} && ` +
                        `npm run build && ` +
                        `sed -i -E "s/(src|href)=\\"\\//\\1=\\"\/gi" build/index.html &&` +
                        `cp -r build/* ../../../public/${target.name}`,
                ),
                blocking: true,
            },
        }),
    ],
    mode: 'development',
};
