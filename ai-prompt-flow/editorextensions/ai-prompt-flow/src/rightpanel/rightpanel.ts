import {EditorClient, isDef, ItemProxy, Panel, PanelLocation, TableBlockProxy, Viewport} from 'lucid-extension-sdk';
import {
    convertToAiShape,
    PromptSegmentBlock,
    SampleBlock,
    SystemPromptBlock,
    UserPromptBlock,
    VariablesTableBlock,
} from '../blocks/blocks';
import {EndpointsProxy} from '../endpointsproxy';
import {PromptExecutor} from '../executor/promptexecutor';
import {
    ExecuteFailedMessage,
    ExecutingMessage,
    MessageFromFrame,
    RightPanelMessageHandler,
    SelectionMessage,
    UpdatePromptTextMessage,
    UpdateTableCellTextMessage,
} from './rightpanelmessage';

export class RightPanel extends Panel {
    private readonly viewport = new Viewport(this.client);
    private readonly messageHandler = new RightPanelMessageHandler(
        this.sendSelectionToPanel.bind(this),
        this.executePrompt.bind(this),
        this.updateBlockText.bind(this),
        this.updateModel.bind(this),
        this.updateTableCellText.bind(this),
        this.addTableRow.bind(this),
        this.deleteTableRow.bind(this),
    );
    constructor(
        client: EditorClient,
        private readonly promptExecutor: PromptExecutor,
        private readonly endpointsProxy: EndpointsProxy,
    ) {
        super(client, {
            title: 'AI Prompt Flow',
            iconUrl:
                "data:image/svg+xml,%3Csvg width='24' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='11' width='11' height='8' rx='2' fill='%233C41C2' fill-opacity='.16'/%3E%3Cpath d='M6 6h7a1 1 0 0 1 1 1v3h1V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.5v3.5H9v-1H7.5V13H9c0-.35.06-.687.17-1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z' fill='%23282C33'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 13a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-4zm2-1h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z' fill='%23282C33'/%3E%3Cg opacity='.35' fill='%23282C33'%3E%3Cpath d='m19 4-.9 1.801a.666.666 0 0 1-.299.298L16 7l1.801.9c.13.065.234.17.298.299L19 10l.9-1.801A.666.666 0 0 1 20.2 7.9L22 7l-1.801-.9A.666.666 0 0 1 19.9 5.8L19 4zM7 7.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H7zM13 13.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zM4.4 17.2 5 16l.6 1.2a.445.445 0 0 0 .2.2L7 18l-1.2.6a.445.445 0 0 0-.2.2L5 20l-.6-1.2a.445.445 0 0 0-.2-.2L3 18l1.2-.6a.445.445 0 0 0 .2-.2z'/%3E%3C/g%3E%3C/svg%3E",
            location: PanelLocation.RightDock,
            url: 'rightpanel/index.html',
            persist: true,
        });

        this.viewport.hookSelection(() => this.sendSelectionToPanel());
        this.viewport.hookTextEdit(
            (item, textAreaKey, text) => this.updatePromptOrTableCellText(item, textAreaKey, text ?? ''),
            true,
        );
    }

    protected override messageFromFrame(message: MessageFromFrame): void {
        this.messageHandler.handleMessage(message);
    }

    public async sendSelectionToPanel() {
        const items = this.viewport
            .getSelectedItems()
            .map((item) => {
                return convertToAiShape(item, this.client);
            })
            .filter(isDef);
        const message: SelectionMessage = {
            'type': 'selection',
            'selectionInfo': items.map((item) => {
                return item.toJSON();
            }),
            'availableModels': (await this.endpointsProxy.getAllEndpoints()).map(
                (endpoint) => endpoint['display-name'],
            ),
        };
        await this.sendMessage(message);
    }

    private updatePromptOrTableCellText(item: ItemProxy, textAreaKey: string, text: string) {
        if (item instanceof TableBlockProxy) {
            const cell = item.getCellByTextAreaKey(textAreaKey);
            if (cell === undefined) {
                return true;
            }

            const message: UpdateTableCellTextMessage = {
                'type': 'updateTableCellText',
                'row': cell.row,
                'column': cell.column,
                'text': text,
            };
            this.sendMessage(message);
        } else {
            const message: UpdatePromptTextMessage = {
                'type': 'updatePromptText',
                'id': textAreaKey,
                'text': text,
            };
            this.sendMessage(message);
        }
        return true;
    }

    private async executePrompt(ids: string[]) {
        const executableBlocks = ids
            .map((id) => {
                const block = this.client.getBlockProxy(id);
                if (block instanceof SystemPromptBlock || block instanceof UserPromptBlock) {
                    return block;
                }

                if (block instanceof TableBlockProxy && block.shapeData.get('isVariables')) {
                    return new VariablesTableBlock(id, this.client);
                }
                return undefined;
            })
            .filter(isDef);

        try {
            await Promise.all(
                executableBlocks.map((block) =>
                    this.promptExecutor.execute(block, () => {
                        this.sendExecuteFailedMessage();
                    }),
                ),
            );
            const message: ExecutingMessage = {
                'type': 'executing',
                'executing': false,
            };
            await this.sendMessage(message);
        } catch {
            await this.sendExecuteFailedMessage();
        }
    }

    private async sendExecuteFailedMessage() {
        const message: ExecuteFailedMessage = {
            'type': 'executeFailed',
            'fail': true,
        };
        await this.sendMessage(message);
    }

    private updateBlockText(id: string, newText: string, textAreaName?: string) {
        const block = this.client.getBlockProxy(id);
        if (
            block instanceof SystemPromptBlock ||
            block instanceof UserPromptBlock ||
            block instanceof PromptSegmentBlock
        ) {
            block.setPromptText(newText, textAreaName);
        }
    }

    private updateModel(id: string, model: string) {
        const block = this.client.getBlockProxy(id);
        if (block instanceof SystemPromptBlock) {
            block.setModelName(model);
        }
    }

    private updateTableCellText(id: string, newText: string, editableRow: number, column: number) {
        const block = this.client.getBlockProxy(id);
        if (VariablesTableBlock.canBeVariablesTableBlock(block)) {
            const variablesBlock = new VariablesTableBlock(id, this.client);
            if (column == 0) {
                variablesBlock.setVariableName(newText, editableRow);
            } else if (column == 1) {
                variablesBlock.setVariableValue(newText, editableRow);
            }
        } else if (SampleBlock.canBeSampleBlock(block)) {
            const sampleBlock = new SampleBlock(id, this.client);
            if (column == 0) {
                sampleBlock.setUser(newText, editableRow);
            } else if (column == 1) {
                sampleBlock.setResponse(newText, editableRow);
            }
        }
    }

    private addTableRow(id: string) {
        const block = this.client.getBlockProxy(id);
        if (VariablesTableBlock.canBeVariablesTableBlock(block)) {
            const variablesBlock = new VariablesTableBlock(id, this.client);
            variablesBlock.addVariable();
        } else if (SampleBlock.canBeSampleBlock(block)) {
            const sampleBlock = new SampleBlock(id, this.client);
            sampleBlock.addSample();
        }
    }

    private deleteTableRow(id: string, editableRow: number) {
        const block = this.client.getBlockProxy(id);
        if (VariablesTableBlock.canBeVariablesTableBlock(block)) {
            const variablesBlock = new VariablesTableBlock(id, this.client);
            variablesBlock.deleteVariable(editableRow);
        } else if (SampleBlock.canBeSampleBlock(block)) {
            const sampleBlock = new SampleBlock(id, this.client);
            sampleBlock.deleteSample(editableRow);
        }
    }
}
