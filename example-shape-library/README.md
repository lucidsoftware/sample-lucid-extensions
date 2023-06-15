# Lucid Example Shape Library

This repository contains the source for an example shape library built on Lucid's extensibility platform. 
You can find more information about creating shapes and shape libraries [here](https://developer.lucid.co/custom-shapes/).

## Getting started

To start developing, make sure you have `lucid-package` installed, then:

```bash
/example-shape-library$ npx lucid-package test-shape-libraries
```

Finally, open a Lucidchart document and look for Example Shape Library in the shapes panel.

While running `test-shape-libraries`, changes you make in the code will cause the library to automatically reload. 
Refreshing the page after making changes is not necessary.

## Folder / file structure

The code is organized into the following folders:
```
└── shapelibraries
    └── example-shape-library
        ├── images
        ├── shapes
        └── library.manifest
```

`/images` contains all the images used by the shape library.

`/shapes` contains the shape definitions for all the shapes in the library.

`/library.manifest` contains metadata about each of the shapes, like which shape file to use, what the shape is called, default styling the shape should use, etc.