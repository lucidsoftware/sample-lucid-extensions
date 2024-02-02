# Lucid / Example card integration

This repository contains the source for an example card integration built on Lucid's extensibility platform. 
This integration is based on the card integration walkthrough presented [here](https://developer.lucid.co/extension-api/#lucid-card-integrations). 
This integration does not connect to any external data source, it instead mocks the data that might otherwise be fetched with an API call.

## Features

The integration adds a toolbar menu option to Lucidspark which allows you to import Lucid cards.

![Example card integration entrypoint](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_cards_entrypoint.png)

From there you can import cards using Lucid's import modal, which can be configured to search or filter by custom fields.

![Example card integration import modal](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_card_integration_modal.png)

You can create cards using the new task callout which is also configured by the extension.

![Example card creation callout](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_card_integration_create_callout.png)

Once imported or created, the cards will appear on the board.

![Example card](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/example_card_integration_card.png)

## Getting started

You will need to install dependencies for both the editor extension as well as the data connector with the package manager of your choice: 
```
/example-card-integration/editorextensions/example-card-integration$ npm install
/example-card-integration/editorextensions/example-card-integration$ cd ../../data-connector/
/data-connector$ npm install
```

Even though we do not connect to third-party, we will still need to configure an OAuth provider to get the data connector to work. 
In this example, we use Smartsheet as our OAuth provider (even though we never make requests to Smartsheet). You are free to use any other service as an OAuth provider for this example integration.

Create a file, `example-card-integration/smartsheet.credentials.local` with the following content:

```
{
    "clientId": "YOUR_CLIENT_ID_FROM_SMARTSHEET",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_SMARTSHEET"
}
```

Run the extension local server:

```
/example-card-integration$ npx lucid-package test-editor-extension example-card-integration
```

Run the data connector:
```
/data-connector$ npx tsc
/data-connector$ node bin/data-connector/debug-server.js 
```

In a Lucidspark document, click the hamburger menu -> "Developer" -> "Load Local Extension".
You should now be able to search for "Example Card Integration" in the "More tools" menu in the bottom left of Lucidspark. 

## Packaging for the Lucid Developer Portal

Create a package in the [Lucid Developer Portal](https://lucid.app/developer) and set up your package UUID by following the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload)

With the OAuth client id, and client secret for your Smartsheet application, you can follow the guide [here](https://developer.lucid.co/extension-api/#using-oauth-apis) to configure your extension and data connector to link to an OAuth provider.

Now you're ready to bundle, upload and install your extension by following the rest of the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload).

For testing purposes you can run the data connector as shown above but it will now need to be at a publicly reachable address.
When you release your extension you will want to serve your data connector in a way that doesn't use the express debug server.

More information about running a data connector can be found [here](https://developer.lucid.co/extension-api/#expose-a-url-for-your-data-connector).

## Folder / file structure

The code is organized into the following folders:
```
├── editorextensions
│   └── example-card-integration
│       └── src
├── shapelibraries
├── common
├── data
└── data-connector
    ├── actions
    └── schema
```

`/editorextensions` contains the extension source code.

`/shapelibraries` contains any shape libraries defined by the extension (in this case none).

`/common` contains code relevant to both the editor extension users will interact with, as well as the data connector.

`/data` contains code sample data that this integration uses to demo the capability of of Lucid's card framework.

`/data-connector` contains the code for the data connector leveraged by the editor extension. 
The data connector handles the responsibility of fetching and formatting the sample data, as well as handling the creation of new sample tasks. You can learn more about data connectors [here](https://developer.lucid.co/extension-api/#connecting-to-external-data).