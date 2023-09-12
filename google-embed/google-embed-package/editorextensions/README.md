# Google Embed Editor Extension
For the Google Embed integration the editor extension is responsible for handling link unfurls for Google Drive and Docs urls.

More information about developing editor extensions can be found [here](https://developer.lucid.co/extension-api/#add-an-editor-extension).

## Folder / file structure

The editor extension code is organized into the following folders:
```
└── goolgle-embed-package
    └── editorextensions
        └── drive
            ├── resources
            │   └── i18n
            └── src
```

`editorextensions` contains all of the source code and resources that are necessary for the integration.

`drive` is the name we have given this editor extension. Note that it is possible to create multiple editor extensions in a single Lucid package, however in this case we only need one.

`resources` contains non code resources, in this case just i18n data.

`src` contains the source code for the editor extension.