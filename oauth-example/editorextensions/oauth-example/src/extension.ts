import { EditorClient, Menu, MenuType } from "lucid-extension-sdk";
import { getLucidFolders } from "./client";

const client = new EditorClient();
const menu = new Menu(client);

client.registerAction("hitAPI", async () => {
  console.log("start");
  const folders = await getLucidFolders(client);
  client.alert(`You have ${folders.length} folders`);
});

menu.addMenuItem({
  label: "Log Folders",
  action: "hitAPI",
  menuType: MenuType.Main,
});
