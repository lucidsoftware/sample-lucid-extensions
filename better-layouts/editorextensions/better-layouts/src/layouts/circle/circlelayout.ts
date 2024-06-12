import {Viewport} from 'lucid-extension-sdk';
import {CircleLayoutOptions, getAverageBoundingBox, getCenterOfViewport} from '../../utils';

export const layoutSelectedItemsInCircle = (circleLayoutOptions: CircleLayoutOptions, viewport: Viewport) => {
    const selectedItems = viewport.getSelectedItems(true);
    const {x, y} = getCenterOfViewport(viewport);
    const averageBox = getAverageBoundingBox(selectedItems);
    const radius =
        circleLayoutOptions.radius !== undefined ?
        circleLayoutOptions.radius:
            Math.max(averageBox.w, averageBox.h) * selectedItems.length / Math.PI;
    
    selectedItems.forEach((item, index) => {
        const angle = index / selectedItems.length * Math.PI * 2;
        const itemX = x + Math.cos(angle) * radius;
        const itemY = y + Math.sin(angle) * radius;
        const box = item.getBoundingBox();
        box.x = itemX - box.w / 2;
        box.y = itemY - box.h / 2;
        item.setBoundingBox(box);
    });
}
