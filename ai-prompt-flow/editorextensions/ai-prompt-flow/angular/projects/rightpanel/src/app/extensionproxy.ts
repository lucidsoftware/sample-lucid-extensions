import {Injectable} from '@angular/core';
import {SerializedAiBlock} from '@extension/blocks/serializedblocks';
import {
    ExecuteFailedMessage,
    ExecutingMessage,
    SelectionMessage,
    UpdatePromptTextEvent,
    UpdatePromptTextMessage,
    UpdateTableCellEvent,
    UpdateTableCellTextMessage,
} from '@extension/rightpanel/rightpanelmessage';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ExtensionProxy {
    private readonly selectionSubject = new BehaviorSubject<SerializedAiBlock[]>([]);
    public readonly currentSelection = this.selectionSubject.asObservable();

    private readonly availableModelsSubject = new BehaviorSubject<string[]>([]);
    public readonly availableModels = this.availableModelsSubject.asObservable();

    private readonly executingSubject = new BehaviorSubject<boolean>(false);
    public readonly executing = this.executingSubject.asObservable();

    private readonly executeFailedSubject = new BehaviorSubject<boolean>(false);
    public readonly executeFailed = this.executeFailedSubject.asObservable();

    private readonly updatePromptTextSubject = new BehaviorSubject<UpdatePromptTextEvent | undefined>(undefined);
    public readonly updatePromptText = this.updatePromptTextSubject.asObservable();

    private readonly updateTableCellTextSubject = new BehaviorSubject<UpdateTableCellEvent | undefined>(undefined);
    public readonly updateTableCellText = this.updateTableCellTextSubject.asObservable();

    constructor() {
        window.addEventListener('load', () => {
            this.requestUpdate();
        });
        window.addEventListener('message', (event) => {
            if (isSelectionMessage(event.data)) {
                this.selectionSubject.next(event.data['selectionInfo']);
                this.availableModelsSubject.next(event.data['availableModels']);
            } else if (isExecutingMessage(event.data)) {
                this.executingSubject.next(event.data['executing']);
            } else if (isExecuteFailedMessage(event.data)) {
                this.executeFailedSubject.next(event.data['fail']);
            } else if (isUpdatePromptTextMessage(event.data)) {
                this.updatePromptTextSubject.next({id: event.data['id'], text: event.data['text']});
            } else if (isUpdateTableCellTextMessage(event.data)) {
                this.updateTableCellTextSubject.next({
                    row: event.data['row'],
                    column: event.data['column'],
                    text: event.data['text'],
                });
            }
        });
    }

    public requestUpdate() {
        parent.postMessage({'type': 'requestSelection'}, '*');
    }
}

function isSelectionMessage(message: unknown): message is SelectionMessage {
    return typeof message == 'object' && !!message && 'type' in message && message.type == 'selection';
}

function isExecutingMessage(message: unknown): message is ExecutingMessage {
    return typeof message == 'object' && !!message && 'type' in message && message.type == 'executing';
}

function isExecuteFailedMessage(message: unknown): message is ExecuteFailedMessage {
    return typeof message == 'object' && !!message && 'type' in message && message.type == 'executeFailed';
}
function isUpdatePromptTextMessage(message: unknown): message is UpdatePromptTextMessage {
    return typeof message == 'object' && !!message && 'type' in message && message.type == 'updatePromptText';
}

function isUpdateTableCellTextMessage(message: unknown): message is UpdateTableCellTextMessage {
    return typeof message == 'object' && !!message && 'type' in message && message.type == 'updateTableCellText';
}
