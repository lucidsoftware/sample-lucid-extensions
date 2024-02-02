import {isNullish, Viewport} from 'lucid-extension-sdk';
import {getAverageBoundingBox, getCenterOfViewport, SpiralLayoutOptions} from '../../utils';

export const layoutSelectedItemsInSpiral = (spiralLayoutOptions: SpiralLayoutOptions, viewport: Viewport) => {
    const selectedItems = viewport.getSelectedItems(true);
    const {x, y} = getCenterOfViewport(viewport);
    const averageBox = getAverageBoundingBox(selectedItems);
    const startRadius =
        Math.max(averageBox.w, averageBox.h);
    const radiusModifier = spiralLayoutOptions.radius !== undefined ?
        spiralLayoutOptions.radius:
        100;
    
    const finalRadius = startRadius + selectedItems.length * radiusModifier;
    
    let angle = 0;
    selectedItems.forEach((item, index) => {
        const spiralRadius = startRadius + (finalRadius - startRadius) * (index / selectedItems.length);
        
        const clockwiseModifier: number =
            (
                spiralLayoutOptions.clockwise ||
                isNullish(spiralLayoutOptions.clockwise)
            ) ? 1 : -1;
        const itemX = x + Math.cos(angle) * spiralRadius * clockwiseModifier;
        const itemY = y + Math.sin(angle) * spiralRadius;
        
        const box = item.getBoundingBox();
        box.x = itemX - box.w / 2;
        box.y = itemY - box.h / 2;
        
        item.setBoundingBox(box);
        
        // The further around the spiral we go, the less we increment the angle so that the items are closer together
        const modifier = (selectedItems.length - index) / selectedItems.length;
        
        const step = spiralLayoutOptions.spacing ?
            spiralLayoutOptions.spacing:
            0.5;
        
        angle += step * modifier
    });
}
