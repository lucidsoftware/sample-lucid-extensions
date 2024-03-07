import { EditorClient, Menu, MenuType } from "lucid-extension-sdk";

const client = new EditorClient();
const menu = new Menu(client);

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

menu.addMenuItem({
  label: "Import",
  action: "import",
  menuType: MenuType.Main,
});
