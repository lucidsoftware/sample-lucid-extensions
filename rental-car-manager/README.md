# Rental Car Manager Starter

This project serves as an ending point for the data visualization guide located [here](https://lucid.readme.io/v1.0/docs/data-visualization).
You can find the starting point [here](https://github.com/lucidsoftware/sample-lucid-extensions/tree/main/rental-car-manager-starter), and also the final app is available for demo in Lucid's integration marketplace [here](https://lucid.app/marketplace#/newlisting/8ea351e3-4e94-4cb4-9ae6-63293e264273).

## Getting started

To develop the extension, you must run both the Angular application and the editor extension development server, installing dependencies as needed.

In one terminal, for the Angular application:

### rental-car-manager-starter/editorextensions/rental-car-manager/angular/

```shell
# Install dependencies
npm install

# Run the Angular application
npx ng serve
```

In another terminal for the editor extension development server:

### rental-car-manager-starter/

```shell
# Run the editor extension
npx lucid-package@latest test-editor-extension rental-car-manager
```

## Directory structure

The code is organized into the following folders:
```
├── editorextensions
|   └── rental-car-manager
|       └── angular
|       └── common
|       └── src
├── public
|   └── angular
└── shapelibraries
    └── rental-car-manager
```

The bulk of the project lives in `editorextensions`, where a few things are happening:
1. The `angular` directory represents a complete Angular application which is used as the contents of a modal for the extension's UI.
2. The extension code which will be run in Lucid's editor lives in the `src` directory
3. The `common` directory houses types and logic shared by both the Angular application and the extension.

The `public` folder represents the static assets that will be hosted alongside the application.
During development, this folder contains only an `index.html` file which is used to target the Angular development server.
When deploying, we put the production angular bundle in this folder so that it will be hosted by Lucid and available to end users using the extension.

Finally, the `shapelibraries` folder contains the shape library which is used by the extension.
For this extension, only a single shape is needed to display custom data for a rental car in the fleet.