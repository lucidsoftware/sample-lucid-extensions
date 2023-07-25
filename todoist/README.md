# Lucid / Todoist integration

This repository contains the source for a Todoist integration.
The integration has the following capabilities:
1. Sets up Todoist user authorization using OAuth 2.0 so users can make requests to Todoist while working in Lucid documents.
2. Adds a menu item to Lucidspark allowing users to search for Todoist tasks they would like to import.
3. Allows users to import Todoist tasks as Lucid Cards. Changes made to the cards in Lucid are sent to Todoist.
4. Live updates to Lucid Cards when updates happen in Todoist.

## Getting started

You will need to install dependencies for both the editor extension as well as the data connector with the package manager of your choice: 
```
/editorextensions/todoist$ npm install
/editorextensions/todoist$ cd ../../dataconnectors/todoist
/dataconnectors/todoist$ npm install
```

In order for your extension and data connector to access Todoist, you will need to set up an OAuth 2.0 application in Todoist by following their directions [here](https://developer.todoist.com/guides/#oauth).
You will need to create a package in the Lucid Developer Dashboard so you can get a package id for your OAuth redirect URL.

The Oauth redirect URL you should register in Todoist is: `https://extensibility.lucid.app/packages/<your package id>/oauthProviders/todoist/authorized`.

Create a file at the root of the extension called `todoist.credentials.local` with the following content:

```
{
    "clientId": "YOUR_CLIENT_ID_FROM_TODOIST",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_TODOIST"
}
```

Run the extension local server:

```
/$ npx lucid-package test-editor-extension todoist
```

Run the data connector:
```
/dataconnectors/todoist$ npx nodemon debug-server.ts
```

In a Lucidspark document, click the hamburger menu -> "Developer" -> "Load Local Extension".
You should now be able to search for Todoist in the "More tools" menu in the bottom right of Lucidspark. 

## Packaging for the Lucid Developer Portal

Create a package in the [Lucid Developer Portal](https://lucid.app/developer) and set up your package UUID by following the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload)

With the OAuth client id, and client secret for your Todoist application, you can follow the guide [here](https://developer.lucid.co/extension-api/#using-oauth-apis) to configure your extension and data connector to use the right Todoist application.

Now you're ready to bundle, upload and install your extension by following the rest of the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload).

For testing purposes you can run the data connector as shown above but it will now need to be at a public address.
When you release your extension you will want to serve your data connector in a way that doesn't use the express debug server.

More information about running a data connector can be found [here](https://developer.lucid.co/extension-api/#expose-a-url-for-your-data-connector).
