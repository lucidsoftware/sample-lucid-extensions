import {EditorClient, Panel, PanelLocation, Viewport, SimpleImageFillPosition} from 'lucid-extension-sdk';

type CancelMessage = {message: 'cancelDrag'};
type DragMessage = {message: 'drag'; data: {name: string; url: string}};
type PointerMessage = {message: 'pointermove' | 'pointerup'; x: number; y: number};
type Message = CancelMessage | DragMessage | PointerMessage;

export class IconPanel extends Panel {
    private viewport = new Viewport(this.client);

    constructor(client: EditorClient) {
        super(client, {
            title: 'demo',
            url: 'panel.html',
            location: PanelLocation.ImageSearchTab,
            iconUrl:
                'https://lucid.app/favicon.ico',
        });
    }

    protected async messageFromFrame(message: Message) {
        if (message.message == 'drag') {
            const maybeBlock = await this.viewport.startDraggingNewBlock({
                className: 'UserImage2Block',
                boundingBox: {x: 0, y: 0, w: 80, h: 80},
                fillStyle: {
                    url: message.data.url,
                    position: SimpleImageFillPosition.Fit,
                },
                lineWidth: 0,
            });
            this.sendMessage('dragDone');
        } else if (message.message == 'pointermove') {
            this.viewport.dragPointerMove(message.x + this.framePosition.x, message.y + this.framePosition.y);
        } else if (message.message == 'pointerup') {
            this.viewport.dragPointerUp(message.x + this.framePosition.x, message.y + this.framePosition.y);
        } else if (message.message == 'cancelDrag') {
            this.viewport.cancelDraggingNewBlock();
        }
    }
}

const client = new EditorClient();
new IconPanel(client);