# Linear Data Actions

This data connector supports four data actions:

1. Import - This action is called by the editor extension when users click a menu option.
2. HardRefresh - This action is called by an automatic process when users first open a document with existing data managed by this extension.
3. Poll - This action is called by an automatic process every 30 seconds while users are viewing a document with data managed by this extension.
4. Patch - This action is called by an automatic process when changes need to be sent back to the API

The first 3 actions all share the same implementation, which fetches ALL of the issues that the user has access to and adds them / updates them as data items on the Lucid document.

The Patch action is called when changes are made to the data items in the Lucid document, and it sends those changes back to the Linear API.
