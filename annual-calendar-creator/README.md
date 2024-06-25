# Annual Calendar Creator

Annual Calendar Creator is a Lucid application that generates monthly calendar shapes for a given year & launguage. This includes languages supported by Lucid products as of June 2024.

This extension includes examples of how to interact with text & formatting in a table shape.

## Getting Started

To make changes to the application, you will need to install the dependencies and run the development server.

```bash
$ npm install
$ npm run test-editor-extension
```

## Folder / file structure

The code is organized into the following folders:

```
└── annual-calendar-creator
    └── editorextensions
        └── annual-calendar-creator
            └── src
                └── extension.ts
                └── calendarsettingsmodal.ts
    └── public
        └── calendarsettings.html
```

extension.ts handles the logic for generating the calendar shapes on a document

calendarsettingsmodal.ts & calendarsettings.html are used to create the modal & pass user input from the modal back to the extension
calendarsettings.html includes localization options, go there to update supported languages

## Terms of Use

Annual Calendar Creator is a tool that generates a calendar shapes in Lucid documents. Before using the tool, please read and agree to the following Terms of Service:

1. Acceptance of Terms: By using Annual Calendar Creator, you agree to be bound by these Terms of Service. If you do not agree to
   these terms, please do not use the tool.

2. Use of the Tool: Annual Calendar Creator is for personal or commercial use. You may not use the tool for any illegal or
   unauthorized purpose.

3. Privacy: Annual Calendar Creator does not collect any user data, information, or personal identifiable data.

4. Limitation of Liability: Annual Calendar Creator is provided on an "as-is" and "as-available" basis. The creators of Annual Calendar Creator
   are not liable for any damages arising from the use of the tool.

5. Modifications to the Terms: The creator of Annual Calendar Creator reserve the right to modify, update, or change these Terms of
   Service at any time without prior notice.

6. Governing Law: These Terms of Service shall be governed by and interpreted in accordance with the laws of The United
   States.

## Privacy Policy

Annual Calendar Creator does not collect any user data, information, or personal identifiable data.