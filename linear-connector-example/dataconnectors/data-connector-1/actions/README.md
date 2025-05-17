# Data Actions

This data connector supports four data actions:

1. Import - This action is called by the editor extension when users click a menu option.
2. HardRefresh - This action is called by an automatic process when users first open a document with existing data managed by this extension.
3. Poll - This action is called by an automatic process every 30 seconds while users are viewing a document with data managed by this extension.
4. Patch - This action is called by an automatic process when changes need to be sent back to the API

The first 3 actions all share the same implementation, which fetches ALL of the folders that the user has access to and adds them / updates them as data items on the Lucid document.

The patch action is unique and is used to update existing folders when users edit their names, or positions within the folder tree by interacting with shapes on the canvas which reference the data rows corresponding with particular folders in the tree structure.
The data can also be edited directly within Lucid's data spreadsheet panel, and updates will be sent to the data connector.
