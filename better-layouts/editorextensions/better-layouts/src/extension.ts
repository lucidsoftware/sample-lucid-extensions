import {EditorClient, Menu, MenuType, Viewport} from 'lucid-extension-sdk';
import {MenuItemConfiguration} from './utils';
import {ControlPanel} from './panel/controlpanel';
import {CircleMenuItemConfiguration} from './layouts/circle/circlemenuitemconfiguration';
import {TriangleMenuItemConfiguration} from './layouts/triangle/trianglemenuitemconfiguration';
import {SpiralMenuItemConfiguration} from './layouts/spiral/spiralmenuitemconfiguration';

const client: EditorClient = new EditorClient();
const menu: Menu = new Menu(client);
const viewport: Viewport = new Viewport(client);
const controlPanel = new ControlPanel(client, viewport);
controlPanel.show();

const multipleItemsSelected = () => {
    return viewport.getSelectedItems().length > 1;
}
client.registerAction('multipleItemsSelected', multipleItemsSelected);

const layouts: MenuItemConfiguration[] = [
    CircleMenuItemConfiguration,
    TriangleMenuItemConfiguration,
    SpiralMenuItemConfiguration,
];

layouts.forEach((layout: MenuItemConfiguration) => {
    const layoutActionName = `layoutSelectedItemsIn${layout.label}`;
    client.registerAction(layoutActionName, () => layout.action(viewport));
    menu.addMenuItem({
        label: layout.label,
        action: layoutActionName,
        menuType: MenuType.Context,
    });
});
