import {EditorClient, Menu, MenuType, Viewport} from 'lucid-extension-sdk';

const client = new EditorClient();
const menu = new Menu(client);
const viewport = new Viewport(client);

client.registerAction('circleUp', () => {
    const selectedItems = viewport.getSelectedItems(true);
    const centerX = selectedItems.reduce((sum, item) => sum + item.getBoundingBox().x, 0) / selectedItems.length;
    const centerY = selectedItems.reduce((sum, item) => sum + item.getBoundingBox().y, 0) / selectedItems.length;
    
    const averageBox = selectedItems.reduce((total, item) => {
        const box = item.getBoundingBox();
        return {
            w: total.w + box.w,
            h: total.h + box.h,
        };
    }, {
        w: 0,
        h: 0,
    });
    averageBox.w /= selectedItems.length;
    averageBox.h /= selectedItems.length;
    
    const radius = Math.max(averageBox.w, averageBox.h) * selectedItems.length / Math.PI;
    
    selectedItems.forEach((item, index) => {
        const angle = index / selectedItems.length * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const box = item.getBoundingBox();
        box.x = x - box.w / 2;
        box.y = y - box.h / 2;
        item.setBoundingBox(box);
    });
});

client.registerAction('itemsSelected', () => {
    const items = viewport.getSelectedItems(true);
    return items.length > 1;
});

menu.addMenuItem({
    label: 'Circle Up!',
    action: 'circleUp',
    menuType: MenuType.Context,
    visibleAction: 'itemsSelected',
});
