# Icon-repository-dragndrop

Icon-repository-dragndrop is a sample Lucid application that adds an icon repository in the lefthand image search tab

## Getting Started

To make changes to the application, you will need to install the dependencies and run the development server.

```bash
$ npm install
$ npx lucid-package test-editor-extension icon-repository-dragndrop
```

## Folder / file structure

The code is organized into the following folders:

```
└── icon-repository-dragndrop
    └── editorextensions
        └── icon-repository-dragndrop
            └── src
                └── extension.ts
    └── public
        └── panel.html
```

The only relevant files are `extension.ts` and `panel.html`, which contains the code for the extension and the html resource used in the panel.