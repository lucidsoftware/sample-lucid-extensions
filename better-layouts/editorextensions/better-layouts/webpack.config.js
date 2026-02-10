const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const angularTargets = [{name: 'controlpanel', port: 4200}];

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
            onWatchRun: {
                scripts: angularTargets.map(
                    (target) =>
                        `mkdir -p ../../public/${target.name} && ` +
                        `curl http://localhost:${target.port} | ` +
                        `sed -E "s/(src|href)=\\"/\\\\1=\\"http:\\/\\/localhost:${target.port}\\//gi" > ` +
                        `../../public/${target.name}/index.html`,
                ),
                blocking: true,
            },
            onBeforeNormalRun: {
                scripts: angularTargets.map(
                    (target) =>
                        `mkdir -p ../../public/${target.name} && ` +
                        `cd ${target.name} && ` +
                        `./node_modules/.bin/ng build && ` +
                        `cp -r dist/${target.name}/* ../../../public/${target.name}`
                ),
                blocking: true,
                swallowError: false,
                safe: true,
            },
        }),
    ],
    mode: 'development',
};
