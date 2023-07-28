import {
    CollectionDefinition,
    CollectionProxy,
    DataSourceProxy,
    EditorClient,
    ExtensionCardFieldDefinition,
    FieldConstraintType,
    FieldDisplayType,
    HorizontalBadgePos,
    isString,
    LucidCardIntegration,
    OnClickHandlerKeys,
    ScalarFieldTypeEnum,
    SemanticKind,
    SerializedFieldType,
} from 'lucid-extension-sdk';
import {DefaultFieldNames} from '../../../common/fields';
import {TodoistClient} from './net/todoistclient';

const MOCK_DATA: string | undefined = undefined;

export class TodoistCardIntegration extends LucidCardIntegration {
    public label = 'Todoist';
    public itemLabel = 'Todoist task';
    public itemsLabel = 'Todoist tasks';
    public iconUrl =
        'https://cdn-cashy-static-assets.lucidchart.com/extensibility/packages/todoist/Todoist-logo-for-card.svg';
    public dataConnectorName: string = 'todoist';
    public showIntro = undefined;

    private todoistClient: TodoistClient;

    constructor(private readonly editorClient: EditorClient) {
        super(editorClient);
        this.todoistClient = new TodoistClient(editorClient, MOCK_DATA);
    }

    public fieldConfiguration = {
        getAllFields: (dataSource: DataSourceProxy) => {
            return Promise.resolve([...Object.values(DefaultFieldNames)]);
        },
    };

    public getDefaultConfig = (dataSource: DataSourceProxy) => {
        return Promise.resolve({
            cardConfig: {
                fieldNames: ['Content'],
                fieldDisplaySettings: new Map([
                    [
                        'Assignee',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.InitializedString,
                                tooltipFormula: '=CONCATENATE("Assigned to ", @Assignee.name)',
                                valueFormula: '=@Assignee.name',
                            },
                        },
                    ],
                    [
                        'Id',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.SquareImageBadge,
                                valueFormula:
                                    '="https://cdn-cashy-static-assets.lucidchart.com/extensibility/packages/todoist/Todoist-logo-for-card.svg"',
                                onClickHandlerKey: OnClickHandlerKeys.OpenBrowserWindow,
                                linkFormula: '=@Link',
                                horizontalPosition: HorizontalBadgePos.RIGHT,
                                tooltipFormula:
                                    '=IF(ISNOTEMPTY(LASTSYNCTIME), "Last synced " & RELATIVETIMEFORMAT(LASTSYNCTIME), "Open in Todoist")',
                                backgroundColor: '#00000000',
                            },
                        },
                    ],
                    [
                        'Due Date',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.DateBadge,
                                tooltipFormula: '=@"Due Date"',
                            },
                        },
                    ],
                ]),
            },
            cardDetailsPanelConfig: {
                fields: [
                    {
                        name: 'Content',
                        locked: true,
                    },
                    {
                        name: 'Assignee',
                        locked: true,
                    },
                    {
                        name: 'Due Date',
                        locked: true,
                    },
                ],
            },
        });
    };
    public importModal = {
        /**
         * Given the values entered by the user so far into search fields, return the list of all search fields
         * to display in the search form.
         */
        getSearchFields: async (
            searchSoFar: Map<string, SerializedFieldType>,
        ): Promise<ExtensionCardFieldDefinition[]> => {
            const projects = await this.todoistClient.getProjects();

            const fields: ExtensionCardFieldDefinition[] = [
                {
                    name: 'search',
                    label: 'Search',
                    type: ScalarFieldTypeEnum.STRING,
                },
                {
                    name: 'project',
                    label: 'Project',
                    type: ScalarFieldTypeEnum.STRING,
                    default: projects[0]?.id,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                    options: projects.map((project) => ({label: project.name, value: project.id})),
                },
            ];

            return fields;
        },

        search: async (
            fields: Map<string, SerializedFieldType>,
        ): Promise<{
            data: CollectionDefinition;
            fields: ExtensionCardFieldDefinition[];
            partialImportMetadata: {collectionId: string; syncDataSourceId?: string};
        }> => {
            let search = fields.get('search');
            if (!isString(search)) {
                search = '';
            }

            const projectId = fields.get('project') as string | undefined;

            const tasks = projectId ? await this.todoistClient.getTasks(projectId, search) : [];
            const projectUsers = projectId ? await this.todoistClient.getProjectUsers(projectId) : [];

            return {
                data: {
                    schema: {
                        fields: [
                            {name: 'id', type: ScalarFieldTypeEnum.STRING, mapping: [SemanticKind.Id]},
                            {name: 'content', type: ScalarFieldTypeEnum.STRING, mapping: [SemanticKind.Title]},
                            {name: 'assignee', type: ScalarFieldTypeEnum.STRING, mapping: [SemanticKind.Assignee]},
                            {name: 'completed', type: ScalarFieldTypeEnum.BOOLEAN},
                            {name: 'due', type: ScalarFieldTypeEnum.DATEONLY, mapping: [SemanticKind.EndTime]},
                        ],
                        primaryKey: ['id'],
                    },
                    items: new Map(
                        tasks.map((task) => [
                            JSON.stringify(task.id),
                            {
                                'id': task.id,
                                'content': task.content,
                                'assignee': projectUsers.find((pu) => pu.id == task.assignee_id)?.name || 'Unassigned',
                                'completed': task.is_completed,
                                'due': task.due ? {'ms': Date.parse(task.due.date), 'isDateOnly': true} : undefined,
                            },
                        ]),
                    ),
                },
                fields: [
                    {
                        name: 'content',
                        label: 'Content',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                    {
                        name: 'assignee',
                        label: 'Assignee',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                    {
                        name: 'completed',
                        label: 'Completed',
                        type: ScalarFieldTypeEnum.BOOLEAN,
                    },
                    {
                        name: 'due',
                        label: 'Due',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                ],
                partialImportMetadata: {
                    collectionId: 'Tasks',
                    syncDataSourceId: projectId,
                },
            };
        },

        import: async (
            primaryKeys: string[],
            searchFields: Map<string, SerializedFieldType>,
        ): Promise<{collection: CollectionProxy; primaryKeys: string[]}> => {
            const projectId = searchFields.get('project');
            if (!isString(projectId) || !projectId) {
                throw new Error('No project selected');
            }
            await this.editorClient.performDataAction('Import', 'todoist', projectId, primaryKeys.map((pk) => JSON.parse(pk)), true);

            const collection = await this.editorClient.awaitDataImport('todoist', projectId, 'Tasks', primaryKeys);

            return {collection, primaryKeys};
        },
    };

    public addCard = {
        getInputFields: async (
            inputSoFar: Map<string, SerializedFieldType>,
        ): Promise<ExtensionCardFieldDefinition[]> => {
            const projects = await this.todoistClient.getProjects();

            const fields: ExtensionCardFieldDefinition[] = [
                {
                    name: 'content',
                    label: 'Content',
                    type: ScalarFieldTypeEnum.STRING,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                },
                {
                    name: 'project',
                    label: 'Project',
                    type: ScalarFieldTypeEnum.STRING,
                    default: projects[0]?.id,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                    options: projects.map((project) => ({label: project.name, value: project.id})),
                },
                {
                    name: 'priority',
                    label: 'Priority',
                    type: ScalarFieldTypeEnum.NUMBER,
                    constraints: [
                        {type: FieldConstraintType.MIN_VALUE, value: 1},
                        {type: FieldConstraintType.MAX_VALUE, value: 4},
                    ],
                    default: 1,
                },
            ];

            return fields;
        },

        createCardData: async (
            input: Map<string, SerializedFieldType>,
        ): Promise<{collection: CollectionProxy; primaryKey: string}> => {
            const projectId = input.get('project');
            if (!isString(projectId) || !projectId) {
                throw new Error('No project selected');
            }

            let collection: CollectionProxy;
            try {
                collection = await this.editorClient.awaitDataImport('todoist', projectId, 'Tasks', [], 1);
            } catch {
                await this.editorClient.performDataAction('Import', 'todoist', projectId, [], true);
                collection = await this.editorClient.awaitDataImport('todoist', projectId, `Tasks`, []);
            }

            const primaryKeys = collection.patchItems({
                added: [
                    {
                        'Project': projectId,
                        'Content': input.get('content'),
                        'Priority': input.get('priority'),
                    },
                ],
            });

            if (primaryKeys.length != 1) {
                throw new Error('Failed to add new card data');
            }

            return {collection, primaryKey: primaryKeys[0]};
        },
    };
}
