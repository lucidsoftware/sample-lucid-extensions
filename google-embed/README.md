# Lucid / Google Embed integration

This repository contains a sample of the source for the Google Embed integration available through Lucid's extension marketplace [here](https://lucid.co/marketplace/72895e4e/google-docs-embedded-links).
The integration has the following capabilities:
1. Sets up a Google user authorization using OAuth 2.0 so users can make requests to Google while working in Lucid documents.
2. Adds a menu item to Lucidspark allowing users to import Google Documents into a Lucid document.
3. Unfurls Google Docs and Drive links pasted on the Lucid canvas.
4. Uses i18n to provide internationalization support for the integration.


This version of the integration **does not include the following features** even though they exist in the marketplace version of the integration.

1. The ability to extract multiple images for Google links (this only supports one page)
2. Support for a myrad of other Google Drive file formats

## Getting started

You will need to install dependencies for the editor extension with the package manager of your choice:
```
/google-embed-package/editorextensions/drive$ npm install
```

In order for your extension to access Google's API, you will need to set up an OAuth application in Google Drive by following their directions [here](https://developers.google.com/identity/protocols/oauth2).
* Create a "Web application" via the Google Console
* You will need the "https://www.googleapis.com/auth/drive.readonly" scope
* Create an OAuth client id credential in the Google Console with the Web application type. Note the client ID and secret to store below
* The redirect uri should be `https://extensibility.lucid.app/packages/<lucid-package-id>/oauthProviders/googleembedexample/authorized`
* Enable the "Google Drive API" library in your project

Create a file, `google-embed-package/googleembedexample.credentials.local` with the following content:

```
{
    "clientId": "YOUR_CLIENT_ID_FROM_GOOGLE",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_GOOGLE"
}
```

Run the extension local server:

```
/google-embed-package$ npx lucid-package test-editor-extension drive
```

In a Lucidspark document, click the hamburger menu -> "Developer" -> "Load Local Extension".
You should now be able to search for Google Embed in the "More tools" menu in the bottom right of Lucidspark.

### Link importer setup
If you would like to set up the link importer for Google Drive, you will need to turn on the Google Picker API on in a Google Cloud project

1. Go to Google [Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=picker.googleapis.com)
2. Click "NEXT" to confirm project then click "ENABLE" to enable the API

## Packaging for the Lucid Developer Portal

Create a package in the [Lucid Developer Portal](https://lucid.app/developer) and set up your package UUID by following the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload)

With the OAuth client id, and client secret for your Google Embed application, you can follow the guide [here](https://developer.lucid.co/extension-api/#using-oauth-apis) to configure your extension to use the right Google Embed application.

Now you're ready to bundle, upload and install your extension by following the rest of the directions [here](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload).

## Folder / file structure

The code is organized into the following folders:
```
├── google-embed
│   └── editorextensions
│       └── drive
```

`/google-embed` contains the editor extension used for the integration, including the package manifest, the extension source code, and any shape libraries defined by the extension (in this case none).

## How to test
Since the google extension is installed by default by Lucid, you will need to somehow handle link unfurling in this extension differently.
One way to do this is to update google-embed/google-embed-package/editorextensions/drive/src/googleembedextension.ts and change the domain to something like
`docs.googleexample.com`. Then modify your pasted links to verify the links are intercepted.
