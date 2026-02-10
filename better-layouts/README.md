# Better Layouts for Lucid Software

This repository contains a Lucid Software application which adds new layouts to Lucid's document editors.
Better Layouts supports circle, triangle, and spiral layouts which can each be customized.

## Features

Layout your selected items in any of the following layouts:
* Circle
* Triangle
* Spiral

Simply select the items you want to layout, right click, then use the Better Layouts context menu item to choose a layout.

![Better Layouts Context Menu](https://ik.imagekit.io/alnazmrug/Better%20Layouts/contextMenu.png?updatedAt=1703883665474)

You can also use the Better Layouts button in the toolbar to open the Better Layouts panel.
From there, you can customize the layout to your liking and apply it to your selected items.

![Better Layouts Panel](https://ik.imagekit.io/alnazmrug/Better%20Layouts/circle.png?updatedAt=1703883650952)

## Getting Started

To develop on the application, you will need to install the dependencies, run the editor extension server, and also run the Angular application.

In one terminal, run the editor extension server:
### /better-layouts
```shell
# Install dependencies
npm install

# Run the editor extension server
npx lucid-package test-editor-extension better-layouts
```

In another terminal, run the Angular application:
### /better-layouts/editorextensions/better-layouts/controlpanel
```shell
# Install dependencies
npm install

# Run the Angular application
ng serve
```

## Folder / file structure

The code is organized into the following folders:
```
├── better-layouts
    └── editorextensions
        └── better-layouts
            ├── controlpanel
            └── src
                ├── layouts
                └── panel
```
`editorextensions/better-layouts` is where the editor extension that supports the entirety of this application lives.

`controlpanel` contains an Angular application which sets up and manages the UI used by the application's in editor panel.

`src/layouts` contains the logic for laying out objects into various shapes.

`src/panel` hooks the Angular UI up to the editor extension.

## Terms of Use

Better Layouts is a tool that takes elements in your Lucid documents and re-arranges them.
Before using the tool, please read and agree to the following Terms of Service:

1. Acceptance of Terms: By using Better Layouts, you agree to be bound by these Terms of Service. If you do not agree to
   these terms, please do not use the tool.

2. Use of the Tool: Better Layouts is for personal or commercial use. You may not use the tool for any illegal or
   unauthorized purpose.

3. Privacy: Better Layouts does not collect any user data, information, or personal identifiable data.

4. Limitation of Liability: Better Layouts is provided on an "as-is" and "as-available" basis. The creators of Better Layouts
   are not liable for any damages arising from the use of the tool.

5. Modifications to the Terms: The creator of Better Layouts reserve the right to modify, update, or change these Terms of
   Service at any time without prior notice.

6. Governing Law: These Terms of Service shall be governed by and interpreted in accordance with the laws of The United
   States of America.

## Privacy Policy

Better Layouts does not collect any user data, information, or personal identifiable data.
