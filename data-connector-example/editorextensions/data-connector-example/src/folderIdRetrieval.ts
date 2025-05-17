import { client, viewport } from "./core";

// Register action to get folder ID from a shape
export function setupFolderIdRetrieval() {
  client.registerAction("getFolderIdFromShape", async () => {
    try {
      // Get the selected shape
      const selectedItems = viewport.getSelectedItems();
      if (selectedItems.length === 0) {
        client.alert("Please select a folder shape first.");
        return;
      }

      const selectedItem = selectedItems[0];

      // Get the folder ID from shape data
      const folderId = selectedItem.shapeData.get('folderId');

      if (folderId) {
        console.log(`Found folder ID in shape data: ${folderId}`);
        client.alert(`This shape represents folder ID: ${folderId}`);
      } else {
        console.log("No folder ID found in shape data");
        client.alert("This shape doesn't have a folder ID stored in its shape data.");
      }
    } catch (error) {
      console.error("Error getting folder ID from shape:", error);
      client.alert(`Error getting folder ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}
