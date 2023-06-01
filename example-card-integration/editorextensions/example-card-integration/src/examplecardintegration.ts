import {
    CardIntegrationConfig,
    DataSourceProxy,
    EditorClient,
    FieldDisplayType,
    HorizontalBadgePos,
    LucidCardIntegration,
    OnClickHandlerKeys,
    VerticalBadgePos,
} from 'lucid-extension-sdk';
import {DataConnecorName, TaskFieldNames} from '../../../common/names';
import {ExampleCardIntegrationImportModal} from './examplecardintegrationimportmodal';
import {ExampleCardIntegerationTaskCreator} from './examplecardintegrationtaskcreator';

export class ExampleLucidCardIntegration extends LucidCardIntegration {
    constructor(private readonly editorClient: EditorClient) {
        super(editorClient);
    }

    public label = 'Example';
    public itemLabel = 'Example task';
    public itemsLabel = 'Example tasks';
    public iconUrl = 'https://cdn-cashy-static-assets.lucidchart.com/marketing/images/LucidSoftwareFavicon.png';
    public dataConnectorName = DataConnecorName;

    public fieldConfiguration = {
        getAllFields: async (dataSource: DataSourceProxy) => {
            return Object.values(TaskFieldNames);
        },
    };

    public getDefaultConfig = async (dataSource: DataSourceProxy): Promise<CardIntegrationConfig> => {
        return {
            cardConfig: {
                fieldNames: [TaskFieldNames.NAME],
                fieldDisplaySettings: new Map([
                    [
                        TaskFieldNames.COMPLETE,
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.BasicTextBadge,
                                horizontalPosition: HorizontalBadgePos.LEFT,
                                backgroundColor: '=IF(@complete, "#b8dedc", "#fff1aa")',
                                valueFormula: '=IF(@complete, "Complete", "Incomplete")',
                            },
                        },
                    ],
                    [
                        TaskFieldNames.ID,
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.SquareImageBadge,
                                valueFormula:
                                    '="https://cdn-cashy-static-assets.lucidchart.com/marketing/images/LucidSoftwareFavicon.png"',
                                onClickHandlerKey: OnClickHandlerKeys.OpenBrowserWindow,
                                linkFormula: '=CONCATENATE("https://www.example.com/data/", @id)',
                                horizontalPosition: HorizontalBadgePos.RIGHT,
                                tooltipFormula: '="Open at example.com"',
                                backgroundColor: '#00000000',
                            },
                        },
                    ],
                    [
                        TaskFieldNames.DUE,
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.DateBadge,
                                tooltipFormula: '=@due',
                            },
                        },
                    ],
                    [
                        TaskFieldNames.COST,
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.StandardEstimation,
                                horizontalPosition: HorizontalBadgePos.RIGHT,
                                verticalPosition: VerticalBadgePos.TOP,
                                valueFormula: '=@cost',
                            },
                        },
                    ],
                ]),
            },
            cardDetailsPanelConfig: {
                fields: [
                    {
                        name: TaskFieldNames.NAME,
                        locked: true,
                    },
                    {name: TaskFieldNames.COMPLETE, locked: true},
                    {name: TaskFieldNames.DUE},
                    {name: TaskFieldNames.COST},
                ],
            },
        };
    };

    public importModal = new ExampleCardIntegrationImportModal(this.editorClient);
    public addCard = new ExampleCardIntegerationTaskCreator(this.editorClient);
}
