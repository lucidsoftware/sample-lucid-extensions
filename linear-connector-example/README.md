# Data Connector Example

This repo contains a very simple integration between Lucid's extension API and Lucid's REST API.
The extension allows users to import their Lucid folder tree as data items onto a Lucid document.
The folders will be visible in the Lucidchart data linking panel, where each row indicates a separate folder in the tree.

## Getting started

This extension relies on Lucid's REST API, which means you must first create an OAuth client for your extension to use through [Lucid's developer portal](https://lucid.app/developer).

Begin by creating a new application with a name of your choosing.
Next click the OAuth 2.0 tab and create an Oauth client with a name of your choosing.

![OAuth2 client setup](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/data-connector-client-setup.gif)

Take the client id and client secret from the page, then create a new file at `/data-connector-example/lucid.credentials.local` with the following contents (substituting your client id and secret for the placeholders):
```
{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
}
```

Then, take the package id out of the URL of the same page and put that into your `/data-connector-example/manifest.json` file.

![Setting the package id](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/setting-package-Id.gif)


Next, add a Redirect URI to your OAuth 2 client.
The URI should be `https://extensibility.lucid.app/packages/PACKAGE_ID/oauthProviders/lucid/authorized` where `PACKAGE_ID` is replaced with your actual package id.

![Setting the redirect URI](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/adding-redirect-uri.gif)


Now you're ready to run the extension. 
Install the dependencies and run the development server with these commands:
```
/data-connector-example$ npm install
/data-connector-example$ npx lucid-package test-editor-extension data-connector-example
```


In a separate terminal, you will also need to install dependencies for and run the data connector server.
```
/data-connector-example$ cd /dataconnectors/data-connector-1
/data-connector-example/dataconnectors/data-connector-1$ npm run start
```

With all that running, you're ready to launch a Lucidchart editor and demo the extension.
Make sure your developer settings are set to run the extension locally!

You will get a new menu item under the `Extensions` dropdown.
The first time the menu item is clicked, the user will be sent through an OAuth 2 authorization flow.
Then, the extension will import all of the Lucid folders the user has access to into the data linking panel.

![Folder tree import](https://cdn-cashy-static-assets.lucidchart.com/open-source-github-repositories/sample-lucid-extensions/folderTreeDemo.gif)

Making updates to the data linking panel will trigger an update to be made to the folders through the REST API.
Try renaming a folder and watch as the name is changed in real time.

## Folder / file structure

The code is organized into the following folders:
```
├── editorextensions
│   └── data-connector-example
│       └── src
│           └── extension.ts
└── dataconnectors
    └── data-connector-1
        ├── actions
        └── collections
```

`/editorextensions` contains the editor extension used for the integration.
For this example, the extension is only responsible for adding a menu item to Lucid's interface, and triggering data actions for the data connector to handle.


`/data-connector` contains the code for the data connector leveraged by the editor extension. 
The data connector hits the Lucid REST API to fetch and update Lucid folders in response to user interactions.