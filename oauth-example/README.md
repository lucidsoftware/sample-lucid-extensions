# OAuth Example

A minimal example showing how to hit an OAuth2 based API using an editor extension.
The extension adds a menu item which hits Lucid's REST API to fetch and log the current user's Lucid folders.

## Getting Started

First install dependencies for the editor extension:
```bash
/oauth-example/editorextensions/oauth-example$ npm i
```

Next, create a new package in Lucid's developer portal, then create an OAuth 2.0 Client.

![Create your package and OAuth client](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/oauth-client-setup.gif)

Next, add a Redirect URI to your OAuth 2 client.
The URI should be `https://extensibility.lucid.app/packages/PACKAGE_ID/oauthProviders/lucid/authorized` where `PACKAGE_ID` is replaced with your actual package id.

![Add redirect URI](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/adding-redirect-uri-2.gif)


Take note of the `Client ID` and `Client Secret` on the OAuth 2.0 page, and create a new text file in the root of the package named `lucid.credentials.local` with the following contents:

/oauth-example/lucid.credentials.local
```json
{
    "clientId": "Replace this with your client id",
    "clientSecret": "Replace this with your client secret"
}
```

Next take the package id you got earlier and add it to the `manifest.json` file at the root of your package where there is currenlty an empty string.

The final step is to start the development server:

```bash
/oauth-example$ npm start
```

Then pull up a Lucid document, make sure you've enabled Load Local Extension through the developer menu, and then you should have a new menu item available through the Extensions menu:

![OAuth example demo](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/oauth-example-demo.gif)

## Folder / file structure

The code is organized into the following folders:
```
├── editorextensions
    └── oauth-example
        └── src
            ├── client.ts
            └── extension.ts
```

`/editorextensions` contains the editor extension used for the integration.
`client.ts` contains code for using Lucid's REST API using `client.oauthXHR`, which handles getting the user's authorization tokens automatically.
`extension.ts` adds a menu item to kick off the network request and display the results.
