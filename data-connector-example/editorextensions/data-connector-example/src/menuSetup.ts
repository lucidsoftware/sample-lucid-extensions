import { MenuType } from "lucid-extension-sdk";
import { client, menu } from "./core";
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
