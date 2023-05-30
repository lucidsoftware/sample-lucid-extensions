# Example Editor Extension
For the Example card integration the editor extension is responsible for providing a user interface for interacting with the data connector.
It provides a way for users to search for the sample tasks they want to import, and details how sample tasks will be visualized in Lucid cards.

More information about developing editor extensions can be found [here](https://developer.lucid.co/extension-api/#add-an-editor-extension).

## Folder / file structure

The editor extension code is organized into the following folders:
```
└── editorextensions
    └── example-card-integration
        └── src
```

`editorextensions` contains all of the source code and resources that are necessary for the integration.

`example-card-integration` is the name we have given this editor extension. Note that it is possible to create multiple editor extensions in a single Lucid package, however in this case we only need one.

`src` contains the source code for the editor extension. 