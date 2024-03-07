# Frontend Frameworks

This repo contains some skeletons for different frontend frameworks you can leverage from you Lucid editor extension.

## Getting started
To make changes to the application, you will need to install the dependencies and run the development server.

Install dependencies for the React app first:

```bash
/frontend-frameworks/editorextensions/react-example/react-example$ npm install
```

Then install the dependencies for the editor extension:

```bash
/frontend-frameworks/editorextensions/react-example$ npm install
```

Then you can run the development server, this will also start any frontend framework development frameworks in the package that have an `npm start` script defined:
```bash
/frontend-frameworks$ npm start
```

With everything running, you can open a new Lucid document, enable "Load local extension" in your developer menu, and you will see a new menu item in top toolbar which opens the react app in a side panel.

![React example](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/react-app-skeleton.png)

## Folder / file structure

The code is organized into the following folders:
```
frontend-frameworks
├── editorextensions
│   └── react-example
│       ├── react-example
│       │   ├── public
│       │   └── src
│       ├── resources
│       └── src
├── public
│   └── react-example
└── shapelibraries
```

`/editorextensions` contains the editor extensions used for the integration.
There is one editor extension per frontend framework.

`/public` contains the files which will be statically hosted alongside the editor extensions, and available through relative urls.
For frontend frameworks during development, the public folder will typically include a `.html` file which links to the locally running server.
When building and deploying your extension for production, you can put the whole production bundle for your frontend application in this folder and it will be statically hosted and available for use by your extension.