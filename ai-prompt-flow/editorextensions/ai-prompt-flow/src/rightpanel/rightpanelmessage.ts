import {SerializedAiBlock} from '../blocks/serializedblocks';

/** Messages sent from the extension to the iframe */
export type SelectionMessage = {'type': 'selection'; 'selectionInfo': SerializedAiBlock[]; 'availableModels': string[]};
export type ExecutingMessage = {'type': 'executing'; 'executing': boolean};
export type ExecuteFailedMessage = {'type': 'executeFailed'; 'fail': boolean};
export type UpdatePromptTextMessage = {'type': 'updatePromptText'; 'id': string; 'text': string};
export type UpdateTableCellTextMessage = {
    'type': 'updateTableCellText';
    'row': number;
    'column': number;
    'text': string;
};
export type MessageFromExtension = SelectionMessage | ExecutingMessage | ExecuteFailedMessage | UpdatePromptTextMessage;

export type UpdatePromptTextEvent = {id: string; text: string};
export type UpdateTableCellEvent = {row: number; column: number; text: string};

/** Messages send from the iframe to the extension */
export type RequestSelection = {'type': 'requestSelection'};
const isRequestSelection = (message: MessageFromFrame): message is RequestSelection => {
    return message['type'] == 'requestSelection';
};
export type UpdateBlockText = {'type': 'updateBlockText'; 'id': string; 'newText': string; 'textAreaName'?: string};
const isUpdateBlockText = (message: MessageFromFrame): message is UpdateBlockText => {
    return message['type'] == 'updateBlockText';
};
export type ExecutePrompt = {'type': 'executePrompts'; 'ids': string[]};
const isExecutePrompts = (message: MessageFromFrame): message is ExecutePrompt => {
    return message['type'] == 'executePrompts';
};
export type UpdateModel = {'type': 'updateModel'; 'id': string; 'model': string};
const isUpdateModel = (message: MessageFromFrame): message is UpdateModel => {
    return message['type'] == 'updateModel';
};
/**
 * The row is relative to the editable rows, not the entire table.
 */
export type UpdateTableCellText = {
    'type': 'updateTableCellText';
    'id': string;
    'newText': string;
    'editableRow': number;
    'column': number;
};
const isUpdateTableCellText = (message: MessageFromFrame): message is UpdateTableCellText => {
    return message['type'] == 'updateTableCellText';
};
export type AddTableRow = {'type': 'addTableRow'; 'id': string};
const isAddTableRow = (message: MessageFromFrame): message is AddTableRow => {
    return message['type'] == 'addTableRow';
};
export type DeleteTableRow = {'type': 'deleteTableRow'; 'id': string; 'editableRow': number};
const isDeleteTableRow = (message: MessageFromFrame): message is DeleteTableRow => {
    return message['type'] == 'deleteTableRow';
};
export type MessageFromFrame =
    | RequestSelection
    | UpdateBlockText
    | ExecutePrompt
    | UpdateModel
    | UpdateTableCellText
    | AddTableRow
    | DeleteTableRow;

/** Routes messages from the iframe to functions registered by the RightPanel. By doing it this way,
 * we are able to share this code with the iframe tests without adding a dependency on
 * lucid-extension-sdk. */
export class RightPanelMessageHandler {
    public requestSelectionCallback: () => void;
    public executePromptsCallback: (ids: string[]) => void;
    public updateBlockTextCallback: (id: string, newText: string, textAreaName?: string) => void;
    public updateModelCallback: (id: string, model: string) => void;
    public updateTableCellTextCallback: (id: string, newText: string, editableRow: number, column: number) => void;
    public addTableRowCallback: (id: string) => void;
    public deleteTableRowCallback: (id: string, editableRow: number) => void;
    constructor(
        requestSelectionCallback: () => void,
        executePromptsCallback: (ids: string[]) => void,
        updateBlockTextCallback: (id: string, newText: string, textAreaName?: string) => void,
        updateModelCallback: (id: string, model: string) => void,
        updateTableCellTextCallback: (id: string, newText: string, editableRow: number, column: number) => void,
        addTableRowCallback: (id: string) => void,
        deleteTableRowCallback: (id: string, editableRow: number) => void,
    ) {
        this.requestSelectionCallback = requestSelectionCallback;
        this.executePromptsCallback = executePromptsCallback;
        this.updateBlockTextCallback = updateBlockTextCallback;
        this.updateModelCallback = updateModelCallback;
        this.updateTableCellTextCallback = updateTableCellTextCallback;
        this.addTableRowCallback = addTableRowCallback;
        this.deleteTableRowCallback = deleteTableRowCallback;
    }

    public handleMessage(message: MessageFromFrame) {
        if (isRequestSelection(message)) {
            this.requestSelectionCallback();
        } else if (isExecutePrompts(message)) {
            this.executePromptsCallback(message['ids']);
        } else if (isUpdateBlockText(message)) {
            this.updateBlockTextCallback(message['id'], message['newText'], message['textAreaName']);
        } else if (isUpdateModel(message)) {
            this.updateModelCallback(message['id'], message['model']);
        } else if (isUpdateTableCellText(message)) {
            this.updateTableCellTextCallback(
                message['id'],
                message['newText'],
                message['editableRow'],
                message['column'],
            );
        } else if (isAddTableRow(message)) {
            this.addTableRowCallback(message['id']);
        } else if (isDeleteTableRow(message)) {
            this.deleteTableRowCallback(message['id'], message['editableRow']);
        }
    }
}
