const path = require('path');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const angularLibraries = ['shared'];
const angularApplicationTargets = [
    {name: 'leftpanel', port: 4200},
    {name: 'rightpanel', port: 4201},
];

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
            //When doing a watch build, run "ng serve" and update the html file to prefix http://localhost:4200/ to all the resource URLs
            onWatchRun: {
                scripts: angularApplicationTargets.map(
                    (target) =>
                        `mkdir -p ../../public/${target.name} &&` +
                        `curl http://localhost:${target.port} | ` +
                        `sed -E "s/(src|href)=\\"/\\\\1=\\"http:\\/\\/localhost:${target.port}\\//gi" > ` +
                        `../../public/${target.name}/index.html`,
                ),
                blocking: true,
            },
            //When doing a full build, run "ng build" and then inline all the final assets into the html file
            onBeforeNormalRun: {
                scripts: [
                    'cd angular && npm install',
                    ...angularLibraries.map(
                        (library) =>
                            `cd angular/projects/${library} && ` +
                            // `npx ng build` usually works, but this is more reliable when used with build tools such as bazel
                            '../../../node_modules/.bin/ng build',
                    ),
                    ...angularApplicationTargets.map(
                        (target) =>
                            `mkdir -p ../../public/${target.name} &&` +
                            `cd angular/projects/${target.name} && ` +
                            // `npx ng build` usually works, but this is more reliable when used with build tools such as bazel
                            `../../../node_modules/.bin/ng build && ` +
                            `cp -r ../../dist/${target.name}/* ../../../../../public/${target.name}`,
                    ),
                ],
                blocking: true,
            },
            swallowError: false,
            // Without `safe: true`, the build will succeed even with errors
            // regardless of the value of swallowError.
            safe: true,
        }),
    ],
    mode: 'development',
};
