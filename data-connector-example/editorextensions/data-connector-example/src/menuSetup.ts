import { MenuType } from "lucid-extension-sdk";
import { client, menu, viewport } from "./core";
import { visualizeFolders } from "./folderVisualization";

// Register actions and set up menu items
export function setupMenus() {
  // Register import action
  client.registerAction("import", async () => {
    // Temporary workaround. You must call oauthXhr once before performDataAction will work
    const triggerOauth = await client.oauthXhr("lucid", {
      url: "https://api.lucid.co/folders/search",
      headers: {
        "Lucid-Api-Version": "1",
        "Content-Type": "application/json",
      },
      data: "{}",
      method: "POST",
    });
    const result = await client.performDataAction({
      dataConnectorName: "data-connector-1",
      actionName: "Import",
      actionData: { message: "ImportFolders" },
      asynchronous: true,
    });
    console.log(result);
  });

  // Add import menu item
  menu.addMenuItem({
    label: "Import",
    action: "import",
    menuType: MenuType.Main,
  });

  // Register visualize action
  client.registerAction("visualize", async () => {
    await visualizeFolders();
  });

  // Add visualize menu item
  menu.addMenuItem({
    label: "Visualize Folders",
    action: "visualize",
    menuType: MenuType.Main,
  });

  // Register action to get folder ID from a shape
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

  // Add menu item to get folder ID from selected shape - in main menu
  menu.addMenuItem({
    label: "Get Folder ID",
    action: "getFolderIdFromShape",
    menuType: MenuType.Main,
  });

  // Also add to context menu (right-click menu) for easier access
  menu.addMenuItem({
    label: "Get Folder ID",
    action: "getFolderIdFromShape",
    menuType: MenuType.Context,
  });
}
