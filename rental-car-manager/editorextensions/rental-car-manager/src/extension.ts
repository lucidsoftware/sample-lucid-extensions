import {
  EditorClient,
  Menu,
  MenuLocation,
  MenuType,
} from "lucid-extension-sdk";

const client = new EditorClient();
const menu = new Menu(client);

const showModal = () => {
  client.alert("Replace me!");
};
client.registerAction("showModal", showModal);

menu.addMenuItem({
  label: "Manage Rental Cars",
  action: "showModal",
  menuType: MenuType.Main,
  location: MenuLocation.Extension,
});
