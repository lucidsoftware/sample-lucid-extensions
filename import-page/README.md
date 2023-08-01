# Import-Page

Import-Page is a tool that imports one or more pages from another Lucid document into your current document.

## Getting Started

To run your application locally, you will need to install the dependencies and run the development server. Additional instructions can be found [here](https://developer.lucid.co/extension-api/#debug-your-editor-extension)

```bash
/import-page/editorextensions/import-page$ npm install
/import-page$ npx lucid-package test-editor-extension import-page
```

## Packaging for the Lucid Developer Portal

Follow [these directions](https://developer.lucid.co/extension-api/#bundle-your-package-for-upload) to bundle, upload, and install your extension on your personal Lucid account.

Note: the extensions for an app are managed under the "Packages" menu inside the application settings.
Click the "+ New Version" button to upload your bundled package.

## Folder / File Structure

The code is organized into the following folders:

```
└── import-page
    └── editorextensions
        └── import-page
            └── resources
                └── import.html
            └── src
                └── extension.ts
                └── importmodal.ts
```

The only relevant files are `extension.ts`, `importmodal.ts`, and `import.html`, which contain the code for the extension.

## Terms of Use

Import-Page is a tool that imports one or more pages from another Lucid document into your current document.
Before using the tool, please read and agree to the following Terms of Service:

1. Acceptance of Terms: By using Import-Page, you agree to be bound by these Terms of Service. If you do not agree to
   these terms, please do not use the tool.

2. Use of the Tool: Import-Page is for personal or commercial use. You may not use the tool for any illegal or
   unauthorized purpose.

3. Privacy: Import-Page does not collect any user data, information, or personal identifiable data.

4. Limitation of Liability: Import-Page is provided on an "as-is" and "as-available" basis. The creators of Import-Page
   are not liable for any damages arising from the use of the tool.

5. Modifications to the Terms: The creator of Import-Page reserve the right to modify, update, or change these Terms of
   Service at any time without prior notice.

6. Governing Law: These Terms of Service shall be governed by and interpreted in accordance with the laws of The United
   States.

## Privacy Policy

Import-Page does not collect any user data, information, or personal identifiable data.