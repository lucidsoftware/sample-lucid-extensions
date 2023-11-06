import {SerializedAiBlock} from '@extension/blocks/serializedblocks';
import {RightPanelMessageHandler, SelectionMessage} from '@extension/rightpanel/rightpanelmessage';

const defaultModels = ['Testing Model', 'Azure GPT-4', 'PaLM 2'];
/**
 * This plays the part of the iframe parent, to allow us to monitor messages sent to/from the
 * iframe. To use:
 * ```
 * let mockParent: MockParent;
 * beforeEach(() => {
 *   mockParent = new MockParent();
 *   spyOn(window.parent, 'postMessage').and.callFake(mockParent.postMessage.bind(mockParent));
 * })
 * ```
 */
export class MockParent {
    public log: any[] = [];
    private selection: SelectionMessage = {
        'type': 'selection',
        selectionInfo: [],
        'availableModels': defaultModels,
    };
    private messageHandler = new RightPanelMessageHandler(
        () => {},
        (ids) => {},
        (id, newText) => {},
        (id, model) => {},
        (id, newText, editableRow, column) => {},
        (id) => {},
        (id, editableRow) => {},
    );

    constructor() {
        this.messageHandler.requestSelectionCallback = () => this.sendResponse(this.selection);
    }

    public postMessage(
        message: any,
        targetOriginOrOptions?: string | WindowPostMessageOptions,
        transfer?: Transferable[],
    ): void {
        this.log.push(message);
    }

    public sendResponse(response: any) {
        window.dispatchEvent(
            new MessageEvent('message', {
                data: response,
            }),
        );
    }

    public setSelection(selection: SerializedAiBlock[], modelOptions: string[] = defaultModels) {
        this.selection = {'type': 'selection', 'selectionInfo': selection, 'availableModels': modelOptions};
        this.sendResponse(this.selection);
    }
}
