import {
  DataProxy,
  EditorClient,
  Menu,
  MenuLocation,
  MenuType,
  Viewport,
} from "lucid-extension-sdk";
import { RentACarModal } from "./modal/rentacarmodal";

const client = new EditorClient();
const menu = new Menu(client);
const dataProxy = new DataProxy(client);
const viewport = new Viewport(client);
const modal = new RentACarModal(client, dataProxy, viewport);

const showModal = () => {
  modal.show();
};
client.registerAction("showModal", showModal);

menu.addMenuItem({
  label: "Manage Rental Cars",
  action: "showModal",
  menuType: MenuType.Main,
  location: MenuLocation.Extension,
});
