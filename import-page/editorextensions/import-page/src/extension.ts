import {EditorClient, Menu, MenuType, Viewport} from 'lucid-extension-sdk';
import {ImportPageModal} from './importmodal';

const client = new EditorClient();
const menu = new Menu(client);
const viewport = new Viewport(client);

client.registerAction('show-modal', () => {
    const modal = new ImportPageModal(client);
    modal.show();
});

menu.addMenuItem({
    label: 'Import page',
    action: 'show-modal',
    menuType: MenuType.Main,
});
