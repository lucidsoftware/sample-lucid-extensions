# Lucid / Asana integration

This repository contains the source for the Asana integration available through Lucid's extension marketplace [here](https://lucid.co/marketplace/59f90498/asana).
The integration has the following capabilities:
1. Sets up Asana user authorization using OAuth 2.0 so users can make requests to Asana while working in Lucid documents.
2. Adds a menu item to Lucidspark allowing users to search for Asana tasks they would like to import.
3. Allows users to import Asana tasks as Lucid Cards. Changes made to the cards in Lucid are sent to Asana.
4. Uses i18n to provide internationalization support for the integration.

This version of the integration **does not include the following features** even though they exist in the marketplace version of the integration.
We will release the code and documentation for these features at a later date:

1. Live updates to Lucid Cards when updates happen in Asana.

## Getting started

You will need to install dependencies for both the editor extension as well as the data connector with the package manager of your choice: 
```
/asana-extension-package/editorextensions/asana$ npm install
/asana-extension-package/editorextensions/asana$ cd ../../../data-connector/
/data-connector$ npm install
```

In order for your extension and data connector to access Asana, you will need to set up an OAuth application in Asana by following their directions [here](https://developers.asana.com/docs/oauth#register-an-application).
The oauth redirect URL you should register in Asana is: `https://extensibility.lucid.app/packages/2711b10f-08af-46a6-accc-3a612aebd627/oauthProviders/asana/authorized`.

Create a file, `asana-extension-package/asana.credentials.local` with the following content:

```
{
    "clientId": "YOUR_CLIENT_ID_FROM_ASANA",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_ASANA"
}
```

Run the extension local server:

```
/asana-extension-package$ npx lucid-package test-editor-extension asana
```

Run the data connector:
```
/data-connector$ npx tsc
/data-connector$ node bin/data-connector/debug-server.js 
```

In a Lucidspark document, click the hamburger menu -> "Developer" -> "Load Local Extension".
You should now be able to search for Asana in the "More tools" menu in the bottom right of Lucidspark. 

## Packaging for the Lucid Developer Portal

Create a package in the [Lucid Developer Portal](https://lucid.app/developer) and set up your package UUID by following the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload)

With the OAuth client id, and client secret for your Asana application, you can follow the guide [here](https://developer.lucid.co/extension-api/#using-oauth-apis) to configure your extension and data connector to use the right Asana application.

Now you're ready to bundle, upload and install your extension by following the rest of the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload).

For testing purposes you can run the data connector as shown above but it will now need to be at a publically reachable address.
When you release your extension you will want to serve your data connector in a way that doesn't use the express debug server.

More information about running a data connector can be found [here](https://developer.lucid.co/extension-api/#expose-a-url-for-your-data-connector).

## Folder / file structure

The code is organized into the following folders:
```
├── editorextensions
│   └── asana
│       ├── resources
│       │   └── i18n
│       └── src
│           ├── model
│           └── net
├── common
└── dataconnectors
    ├── actions
    ├── collections
    ├── routes
    └── utils
```

`/asana-extension-package` contains the editor extension used for the integration, including the package manifest, the extension source code, and any shape libraries defined by the extension (in this case none).

`/common` contains code relevant to both the editor extension users will interact with, as well as the data connector that actually fetches and manipulates data sent to and from Asana.

`/data-connector` contains the code for the data connector leveraged by the editor extension. 
The data connector handles the responsiblity of fetching and formatting Asana data, as well as sending updates made in Lucid documents to Asana. You can learn more about data connectors [here](https://developer.lucid.co/extension-api/#connecting-to-external-data).