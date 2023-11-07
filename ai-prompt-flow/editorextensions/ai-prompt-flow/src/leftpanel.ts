import {
    BlockDefinition,
    CommandName,
    EditorClient,
    Panel,
    PanelLocation,
    TextMarkupNames,
    Viewport,
} from 'lucid-extension-sdk';
import {TableBlockProxy, TableCellProxy} from 'lucid-extension-sdk/document/blockclasses/tableblockproxy';
import {BlockProxy} from 'lucid-extension-sdk/document/blockproxy';
import {ReadonlyAiEndpointConfiguration} from './aiendpointconfiguration/aiendpointconfiguration';
import {
    PromptSegmentBlock,
    SystemPromptBlock,
    UserPromptBlock,
    getKeyValuePairFromRow,
    getKeyValuePairFromTable,
    nearestSystemPromptBlock,
    nearestUserPromptBlock,
} from './blocks/blocks';
import {EndpointsProxy} from './endpointsproxy';
import {RightPanel} from './rightpanel/rightpanel';

interface DragMessage {
    message: 'drag';
    shape: 'user' | 'system' | 'examples' | 'segment' | 'variables';
    prompt: string | undefined;
    branch: string | undefined;
    defaultModel: string;
}

interface MoveMessage {
    message: 'pointermove';
    x: number;
    y: number;
}

interface UpMessage {
    message: 'pointerup';
    x: number;
    y: number;
}

interface CancelMessage {
    message: 'cancelDrag';
}

interface RequestEndpointsMessage {
    message: 'requestEndpoints';
}

interface UpdateEndpointsMessage {
    message: 'updateEndpoints';
    endpoints: ReadonlyAiEndpointConfiguration[];
}

interface CheckCanEditPackageSettingsMessage {
    message: 'checkCanEditPackageSettings';
}

interface FeedbackMessage {
    message: 'feedback';
    rating: number;
    feedback: string;
}

type PanelMessage =
    | DragMessage
    | MoveMessage
    | UpMessage
    | CancelMessage
    | RequestEndpointsMessage
    | UpdateEndpointsMessage
    | CheckCanEditPackageSettingsMessage
    | FeedbackMessage;

const TableRowHeight = 51; // The height of the row with a single line of 10pt text
const TableColumnWidth = 350;

export class LeftPanel extends Panel {
    private readonly viewport = new Viewport(this.client);

    private systemPromptDef = this.client.getCustomShapeDefinition(SystemPromptBlock.library, SystemPromptBlock.shape);
    private userPromptDef = this.client.getCustomShapeDefinition(UserPromptBlock.library, UserPromptBlock.shape);
    private promptSegmentDef = this.client.getCustomShapeDefinition(
        PromptSegmentBlock.library,
        PromptSegmentBlock.shape,
    );

    constructor(
        client: EditorClient,
        private readonly endpointsProxy: EndpointsProxy,
        private readonly rightPanel: RightPanel,
    ) {
        super(client, {
            title: 'AI Prompt Flow',
            iconUrl:
                "data:image/svg+xml,%3Csvg width='24' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='11' width='11' height='8' rx='2' fill='%233C41C2' fill-opacity='.16'/%3E%3Cpath d='M6 6h7a1 1 0 0 1 1 1v3h1V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.5v3.5H9v-1H7.5V13H9c0-.35.06-.687.17-1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z' fill='%23282C33'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 13a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-4zm2-1h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z' fill='%23282C33'/%3E%3Cg opacity='.35' fill='%23282C33'%3E%3Cpath d='m19 4-.9 1.801a.666.666 0 0 1-.299.298L16 7l1.801.9c.13.065.234.17.298.299L19 10l.9-1.801A.666.666 0 0 1 20.2 7.9L22 7l-1.801-.9A.666.666 0 0 1 19.9 5.8L19 4zM7 7.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H7zM13 13.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zM4.4 17.2 5 16l.6 1.2a.445.445 0 0 0 .2.2L7 18l-1.2.6a.445.445 0 0 0-.2.2L5 20l-.6-1.2a.445.445 0 0 0-.2-.2L3 18l1.2-.6a.445.445 0 0 0 .2-.2z'/%3E%3C/g%3E%3C/svg%3E",
            location: PanelLocation.ContentDock,
            url: 'leftpanel/index.html',
            width: 290,
        });
    }

    private async getExampleBlock() {
        await this.client.loadBlockClasses(['DefaultTableBlock']);
        return {
            className: 'DefaultTableBlock',
            boundingBox: {x: 0, y: 0, w: 700, h: 160},
            properties: {
                'ColWidths': [TableColumnWidth, TableColumnWidth],
                'RowHeights': [TableRowHeight, TableRowHeight, TableRowHeight, TableRowHeight],
            },
        };
    }

    private async getVariablesBlock() {
        await this.client.loadBlockClasses(['DefaultTableBlock']);
        return {
            className: 'DefaultTableBlock',
            boundingBox: {x: 0, y: 0, w: 700, h: 160},
            properties: {
                'ColWidths': [TableColumnWidth, TableColumnWidth],
                'RowHeights': [TableRowHeight, TableRowHeight, TableRowHeight],
            },
        };
    }

    private linkTwoBlocks(block: BlockProxy, nearest: BlockProxy) {
        block.getPage().addLine({
            endpoint1: {
                connection: nearest,
                linkX: 0.5,
                linkY: 1,
            },
            endpoint2: {
                connection: block,
                linkX: 0.5,
                linkY: 0,
            },
        });
    }

    private getHeaderCell(table: TableBlockProxy): TableCellProxy {
        const rows = table.getRows();
        const headerCell = rows[0]?.getCells()[0];
        if (!headerCell) {
            throw new Error('No header cell found on table');
        }
        return headerCell;
    }

    private setupTableBlock(block: TableBlockProxy) {
        block.setColumnWidths([TableColumnWidth, TableColumnWidth]);
        block.setRowHeights([TableRowHeight, TableRowHeight]);
        block.setAutoResizeColumns(true);
        block.setAutoResizeRows(true);
        block.setInsetMargin(12);
        const headerCell = this.getHeaderCell(block);
        headerCell.setTextStyle({bold: true});
        headerCell.setMergedCellSize({w: 2, h: 1});
        headerCell.setFill('#ffffff');
    }

    private setupExampleBlock(
        block: TableBlockProxy,
        nearest: BlockProxy | undefined,
        existingExamples: Map<string, string> = new Map(),
    ) {
        const headerCell = this.getHeaderCell(block);

        headerCell.setText('Few Shot Learning Examples');
        headerCell.setTextStyle({[TextMarkupNames.HAlign]: 'left'});
        if (existingExamples.size == 0) {
            block.setRowHeights([TableRowHeight, TableRowHeight, TableRowHeight, TableRowHeight]);
        } else {
            const heights = [TableRowHeight, TableRowHeight];
            const keys = Array.from(existingExamples.keys());
            const values = Array.from(existingExamples.values());
            for (const name of keys) {
                heights.push(TableRowHeight);
            }
            block.setRowHeights(heights);

            block
                .getRows()
                .slice(2)
                .forEach((row, index) => {
                    const {keyCell, valueCell} = getKeyValuePairFromRow(row);
                    keyCell.setText(keys[index] ?? '');
                    valueCell.setText(values[index] ?? '');
                });
        }

        const {keyCell: userHeader, valueCell: assistantHeader} = getKeyValuePairFromTable(1, block);
        userHeader.setFill('#ffffff');
        userHeader.setText('User');
        userHeader.setTextStyle({[TextMarkupNames.HAlign]: 'left'});
        assistantHeader.setFill('#ffffff');
        assistantHeader.setText('Response');
        assistantHeader.setTextStyle({[TextMarkupNames.HAlign]: 'left'});

        //Mark it as sample input
        block.shapeData.set('isSampleInput', true);

        if (nearest) {
            block.getPage().addLine({
                endpoint1: {
                    connection: block,
                    linkX: 0.5,
                    linkY: 1,
                },
                endpoint2: {
                    connection: nearest,
                    linkX: 0.5,
                    linkY: 0,
                },
            });
        }
    }

    private setupVariablesBlock(
        block: TableBlockProxy,
        nearest: UserPromptBlock | undefined,
        existingVariables: Map<string, string> = new Map(),
    ) {
        const headerCell = this.getHeaderCell(block);
        const neededVariables = (nearest?.getNeededUserVariables() ?? []).map((withBraces) =>
            withBraces.substring(2, withBraces.length - 1),
        );
        if (existingVariables.size == 0) {
            if (neededVariables.length == 0) {
                neededVariables.push('');
            }
            const heights = [TableRowHeight, TableRowHeight];
            for (const name of neededVariables) {
                heights.push(TableRowHeight);
            }
            block.setRowHeights(heights);
            block
                .getRows()
                .slice(2)
                .forEach((row, index) => {
                    row.getCells()[0]?.setText(neededVariables[index] ?? '');
                });
        } else {
            const heights = [TableRowHeight, TableRowHeight];
            const keys = Array.from(existingVariables.keys());
            const values = Array.from(existingVariables.values());
            for (const name of keys) {
                heights.push(TableRowHeight);
            }
            block.setRowHeights(heights);

            block
                .getRows()
                .slice(2)
                .forEach((row, index) => {
                    const {keyCell, valueCell} = getKeyValuePairFromRow(row);
                    keyCell.setText(keys[index] ?? '');
                    valueCell.setText(values[index] ?? '');
                });
        }

        headerCell.setText('User Provided Variables');
        headerCell.setFill('#ffffff');
        headerCell.setTextStyle({[TextMarkupNames.HAlign]: 'left'});

        const {keyCell: nameHeader, valueCell: valueHeader} = getKeyValuePairFromTable(1, block);
        nameHeader.setFill('#ffffff');
        nameHeader.setText('Name');
        nameHeader.setTextStyle({[TextMarkupNames.HAlign]: 'left'});
        valueHeader.setFill('#ffffff');
        valueHeader.setText('Value');
        valueHeader.setTextStyle({[TextMarkupNames.HAlign]: 'left'});

        //Mark it as variables
        block.shapeData.set('isVariables', true);

        //Connect it to the nearest user prompt block
        if (nearest) {
            block.getPage().addLine({
                endpoint1: {
                    connection: nearest,
                    linkX: 0.5,
                    linkY: 1,
                },
                endpoint2: {
                    connection: block,
                    linkX: 0.5,
                    linkY: 0,
                },
            });
        }
    }

    private setupTableBlockStyle(block: TableBlockProxy) {
        for (const row of block.getRows().slice(2)) {
            for (const cell of row.getCells()) {
                cell.setTextStyle({
                    [TextMarkupNames.HAlign]: 'left',
                    [TextMarkupNames.Size]: 10,
                });
            }
        }
    }

    private async getDefinitionForShape(shape: string) {
        switch (shape) {
            case 'system':
                return await this.systemPromptDef;

            case 'user':
                return await this.userPromptDef;

            case 'segment':
                return await this.promptSegmentDef;

            case 'examples':
                return await this.getExampleBlock();

            case 'variables':
                return await this.getVariablesBlock();
        }
        return undefined;
    }

    protected override async messageFromFrame(message: PanelMessage) {
        if (message.message == 'drag') {
            let def: BlockDefinition | undefined;
            def = await this.getDefinitionForShape(message.shape);

            if (!def) {
                console.log(`No block definition found for shape: ${message.shape}`);
                // Sometimes everything but the table blocks can't be dragged, but I haven't been
                // able to reproduce reliably. Given that the table-based blocks still work, my best guess
                // is the custom shape definitions weren't loaded correctly.
                this.systemPromptDef = this.client.getCustomShapeDefinition(
                    SystemPromptBlock.library,
                    SystemPromptBlock.shape,
                );
                this.userPromptDef = this.client.getCustomShapeDefinition(
                    UserPromptBlock.library,
                    UserPromptBlock.shape,
                );
                this.promptSegmentDef = this.client.getCustomShapeDefinition(
                    PromptSegmentBlock.library,
                    PromptSegmentBlock.shape,
                );
                def = await this.getDefinitionForShape(message.shape);
                if (!def) {
                    throw new Error(
                        `Failed to get block definition for "${message.shape}" even after reloading definitions.`,
                    );
                }
            }
            if (def) {
                const block = await this.viewport.startDraggingNewBlock(def);

                if (block instanceof SystemPromptBlock) {
                    block.shapeData.set('Model', message.defaultModel);
                }

                if (block instanceof UserPromptBlock) {
                    //Connect it to the nearest system prompt block
                    const nearest = nearestSystemPromptBlock(block.getPage(), block.getBoundingBox());
                    if (nearest) {
                        this.linkTwoBlocks(block, nearest);
                    }
                } else if (block instanceof TableBlockProxy) {
                    this.setupTableBlock(block);
                    if (message.shape === 'examples') {
                        //Connect it to the nearest system prompt block
                        const nearest = nearestSystemPromptBlock(block.getPage(), block.getBoundingBox());
                        this.setupExampleBlock(block, nearest);
                    } else if (message.shape === 'variables') {
                        const nearest = nearestUserPromptBlock(block.getPage(), block.getBoundingBox());
                        this.setupVariablesBlock(block, nearest);
                    }
                    this.setupTableBlockStyle(block);
                }

                block?.setShadow({angle: 270, blur: 16, color: '#00000033', distance: 3});

                await this.sendMessage({
                    'message': 'dragDone',
                });

                // Update the right panel after the automatic connections have been made, to ensure
                // the right panel is up to date with the state of the canvas.
                await this.rightPanel.sendSelectionToPanel();
            }
        } else if (message.message == 'pointermove') {
            this.viewport.dragPointerMove(message.x + this.framePosition.x, message.y + this.framePosition.y);
        } else if (message.message == 'pointerup') {
            this.viewport.dragPointerUp(message.x + this.framePosition.x, message.y + this.framePosition.y);
        } else if (message.message == 'cancelDrag') {
            this.viewport.cancelDraggingNewBlock();
        } else if (message.message == 'requestEndpoints') {
            const endpoints = await this.endpointsProxy.refreshAndGetAllEndpoints();
            await this.sendMessage({
                'endpoints': endpoints,
            });
        } else if (message.message == 'updateEndpoints') {
            await this.endpointsProxy.setEndpoints(message.endpoints);
            // ensure model selection in the right panel is up to date
            await this.rightPanel.sendSelectionToPanel();
        } else if (message.message == 'checkCanEditPackageSettings') {
            const canEditPackageSettings = await this.client.canEditPackageSettings();
            await this.sendMessage({
                'message': 'canEditPackageSettings',
                'canEditPackageSettings': canEditPackageSettings,
            });
        } else if (message.message == 'feedback') {
            const beaconEvent = {
                'name': 'sentAiFeedback',
                'aiInteractionType': 'used ai prompt flow',
                'rating': message.rating >= 4 ? 'thumbs up' : 'thumbs down',
                'comment': 'Score: ' + message.rating + '/5. Comment: ' + message.feedback,
            };
            console.log(beaconEvent);
        }
    }
}
