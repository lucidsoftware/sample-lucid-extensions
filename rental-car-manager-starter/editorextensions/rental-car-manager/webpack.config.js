const path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

const angularTargets = [{ name: "angular", port: 4200 }];

module.exports = {
  entry: "./src/extension.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /[\\\/]resources[\\\/]/,
        use: "raw-loader",
        exclude: /\.json$/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bin/extension.js",
    path: __dirname,
  },
  plugins: [
    new WebpackShellPluginNext({
      //When doing a watch build, run "ng serve" and update the html file to prefix http://localhost:4200/ to all the resource URLs
      onWatchRun: {
        scripts: angularTargets.map(
          (target) =>
            `mkdir -p ../../public/${target.name} &&` +
            `curl http://localhost:${target.port} | ` +
            `sed -E "s/(src|href)=\\"/\\\\1=\\"http:\\/\\/localhost:${target.port}\\//gi" > ` +
            `../../public/${target.name}/index.html`,
        ),
        blocking: true,
      },
      //When doing a full build, run "ng build" and then copy all the assets to the root level public folder
      onBeforeNormalRun: {
        scripts: angularTargets.map(
          (target) =>
            `mkdir -p ../../public/${target.name} &&` +
            `cd ${target.name} && ` +
            // `npx ng build` usually works, but this is more reliable when used with build tools
            `./node_modules/.bin/ng build && ` +
            `cp -r dist/${target.name}/browser/* ../../../public/${target.name}`,
        ),
        blocking: true,
        swallowError: false,
        safe: true,
      },
    }),
  ],
  mode: "development",
};
