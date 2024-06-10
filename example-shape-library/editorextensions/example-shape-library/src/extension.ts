import {
  EditorClient,
  Menu,
  MenuLocation,
  MenuType,
  Viewport,
} from "lucid-extension-sdk";

const client = new EditorClient();
const menu = new Menu(client);
const viewport = new Viewport(client);

client.registerAction("drawCustomShape", async () => {
  const page = viewport.getCurrentPage();
  if (!page) return;

  const customShapeDef = await client.getCustomShapeDefinition(
    "example-shape-library",
    "Rectangle"
  );
  if (!customShapeDef) return;

  const position = viewport.findAvailableSpace(
    customShapeDef.boundingBox.h,
    customShapeDef.boundingBox.w
  );
  page.addBlock({
    ...customShapeDef,
    ...position,
  });
});

client.registerAction("drawSalesforceShape", async () => {
  await client.loadBlockClasses(["SFACard"]);
  const page = viewport.getCurrentPage();
  if (!page) return;

  const size = {
    h: 80,
    w: 320,
  };

  const position = viewport.findAvailableSpace(size.w, size.h);
  page.addBlock({
    className: "SFACard",
    boundingBox: {
      ...position,
      h: 80,
      w: 320,
    },
  });
});

client.registerAction("logBlockClass", () => {
  const selection = viewport.getSelectedItems().pop();
  if (!selection) return;

  const page = viewport.getCurrentPage();
  if (!page) return;

  const blockWithSameId = page.blocks.get(selection.id);
  console.log(blockWithSameId.getClassName());
});

client.registerAction("singleShapeSelected", () => {
  const items = viewport.getSelectedItems();
  return items.length === 1;
});

menu.addMenuItem({
  label: "Draw custom rectangle",
  action: "drawCustomShape",
  menuType: MenuType.Main,
  location: MenuLocation.Extension,
});

menu.addMenuItem({
  label: "Draw Salesforce card",
  action: "drawSalesforceShape",
  menuType: MenuType.Main,
  location: MenuLocation.Extension,
});

menu.addMenuItem({
  label: "Log block class",
  action: "logBlockClass",
  menuType: MenuType.Context,
  visibleAction: "singleShapeSelected",
});
