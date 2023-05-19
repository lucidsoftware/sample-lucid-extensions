# Asana Editor Extension
For the Asana integration the editor extension is responsible for providing a user interface for interacting with the data connector.
It provides a way for users to search for Asana tasks they want to import, and details how Asana tasks will be visualized in Lucid cards.

More information about developing editor extensions can be found [here](https://developer.lucid.co/extension-api/#add-an-editor-extension).

## Folder / file structure

The editor extension code is organized into the following folders:
```
└── asana-extension-package
    └── editorextensions
        └── asana
            ├── resources
            │   └── i18n
            └── src
                ├── model
                └── net
```

`editorextensions` contains all of the source code and resources that are necessary for the integration.

`asana` is the name we have given this editor extension. Note that it is possible to create multiple editor extensions in a single Lucid package, however in this case we only need one.

`resources` contains non code resources, in this case just i18n data.

`src` contains the source code for the editor extension. 
The `model` sub-folder contains classes to represent Asana data types that the editor extension will leverage.
The `net` sub-folder contains a client for sending requests to Asana using `client.oauthXhr` as described [here](https://developer.lucid.co/extension-api/#call-the-api-with-editorclient).