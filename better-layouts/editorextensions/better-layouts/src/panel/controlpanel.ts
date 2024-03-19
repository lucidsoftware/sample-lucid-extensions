import {EditorClient, JsonSerializable, Panel, PanelLocation, Viewport} from 'lucid-extension-sdk';
import {layoutSelectedItemsInCircle} from '../layouts/circle/circlelayout';
import {isCircleLayoutOptions, isSpiralLayoutOptions, isTriangleLayoutOptions} from '../utils';
import {layoutSelectedItemsInTriangle} from '../layouts/triangle/trianglelayout';
import {layoutSelectedItemsInSpiral} from '../layouts/spiral/spirallayout';

export class ControlPanel extends Panel {
    private static icon = 'https://ik.imagekit.io/alnazmrug/Better%20Layouts/favicon.png';
    
    constructor(client: EditorClient, private viewport: Viewport) {
        super(client, {
            title: 'Better Layouts',
            location: PanelLocation.ContentDock,
            url: 'controlpanel/index.html',
            iconUrl: ControlPanel.icon,
        });
    }
    
    protected messageFromFrame(message: JsonSerializable): void {
        if (isCircleLayoutOptions(message)) {
            layoutSelectedItemsInCircle(message, this.viewport);
        } else if(isTriangleLayoutOptions(message)) {
            layoutSelectedItemsInTriangle(message, this.viewport);
        } else if(isSpiralLayoutOptions(message)) {
            layoutSelectedItemsInSpiral(message, this.viewport);
        }
    }
}
