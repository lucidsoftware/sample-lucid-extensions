# Rental Car Manager Starter

This project serves as a starting point for the data visualization guide located [here](https://lucid.readme.io/v1.0/docs/data-visualization).
You can find the final version of the project [here](https://github.com/lucidsoftware/sample-lucid-extensions/tree/main/rental-car-manager), and available for demo in Lucid's integration marketplace [here](https://lucid.app/marketplace#/newlisting/8ea351e3-4e94-4cb4-9ae6-63293e264273).

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
