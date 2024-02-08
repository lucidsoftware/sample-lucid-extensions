import {
    CollectionDefinition,
    CollectionProxy,
    DataSourceProxy,
    EditorClient,
    ExtensionCardFieldDefinition,
    FieldConstraintType,
    FieldDisplayType,
    FieldTypeArray,
    HorizontalBadgePos,
    isString,
    isTypedArray,
    LucidCardIntegration,
    LucidCardIntegrationRegistry,
    OnClickHandlerKeys,
    ScalarFieldTypeEnum,
    SemanticKind,
    SerializedFieldType,
} from 'lucid-extension-sdk';
import {TaskCollectionName} from '../../../common/constants';
import {convertDueAtToDateonly} from '../../../common/date';
import {DefaultFieldNames} from '../../../common/fields';
import {WorkspaceCompact} from './model/asanamodel';
import {AsanaClient} from './net/asanaclient';

const MOCK_DATA: string | undefined = undefined;

export class AsanaCardIntegration extends LucidCardIntegration {
    /** The list of fields to query via the Asana API when getting tasks; must match Asana API */
    private readonly taskFields = ['gid', 'name', 'assignee.name', 'completed', 'due_at', 'due_on'];

    private asanaClient: AsanaClient;

    private _workspacesPromise: Promise<WorkspaceCompact[]> | undefined;
    private getWorkspaces() {
        if (!this._workspacesPromise) {
            this._workspacesPromise = this.asanaClient.getWorkspaces();
        }
        this._workspacesPromise.catch((e) => (this._workspacesPromise = undefined));
        return this._workspacesPromise;
    }

    /**
     * This stores the ID's of the most recent projects into which we have created a task or imported a task from.
     */
    private defaultCreationProjects: Set<string> = new Set();

    private projectIdToName: Map<string, string> = new Map();

    private projectSearchCallback = LucidCardIntegrationRegistry.registerFieldSearchCallback(
        this.editorClient,
        async (search, inputSoFar) => {
            const workspaceId = inputSoFar.get('workspace');
            if (isString(workspaceId)) {
                const projects: {label: string; value: string}[] = [];
                (await this.asanaClient.typeaheadProjects(workspaceId, search)).forEach((project) => {
                    this.projectIdToName.set(project.gid, project.name);
                    if (!this.defaultCreationProjects.has(project.gid)) {
                        projects.push({
                            label: project.name,
                            value: project.gid,
                        });
                    }
                });
                // We append the default projects to the list of available options.
                return projects.concat(
                    [...this.defaultCreationProjects].map((projectId) => ({
                        label: this.projectIdToName.get(projectId) ?? projectId,
                        value: projectId,
                    })),
                );
            }
            return [];
        },
    );

    private userSearchCallback = LucidCardIntegrationRegistry.registerFieldSearchCallback(
        this.editorClient,
        async (search, inputSoFar) => {
            const workspaceId = inputSoFar.get(DefaultFieldNames.Workspace);
            if (isString(workspaceId)) {
                return (await this.asanaClient.typeaheadUsers(workspaceId, search)).map((user) => {
                    return {
                        label: user.name,
                        value: user.gid,
                        iconUrl: user.photo?.['image_60x60'],
                    };
                });
            }
            return [];
        },
    );

    /**
     * Updates the projects that are used as the defaults during task creation.
     */
    private updateDefaultCreationProjects(projects: SerializedFieldType) {
        this.defaultCreationProjects.clear();
        if (isTypedArray(isString)(projects)) {
            projects.forEach((project) => this.defaultCreationProjects.add(project));
        }
    }

    /**
     * When the user has not input any search values, we get the list of tasks assigned to the user
     */
    private async getTaskList(fields: Map<string, SerializedFieldType>) {
        const workspaceId = fields.get('workspace') as string | undefined;
        if (!workspaceId) {
            return [];
        }

        if (this.shouldShowUserAssignedTasks(fields)) {
            return await this.getUserAssignedTasks(workspaceId);
        } else {
            let search = fields.get('search');
            if (!isString(search)) {
                search = '';
            }

            const projectIds = fields.get('project') as string[] | undefined;

            return await this.asanaClient.searchTasks({
                workspaceId,
                projectIds: projectIds && projectIds.length > 0 ? projectIds : undefined,
                searchQuery: search,
                completed: fields.get('completed') as boolean | undefined,
                fields: this.taskFields,
            });
        }
    }

    private shouldShowUserAssignedTasks(fields: Map<string, SerializedFieldType>): boolean {
        const keySet = new Set(fields.keys());
        keySet.delete('workspace');

        const projectIds = fields.get('project') as string[] | undefined;
        if (projectIds && projectIds.length == 0) {
            keySet.delete('project');
        }

        return keySet.size == 0;
    }

    private async getUserAssignedTasks(workspaceId: string) {
        const userTaskList = await this.asanaClient.getUserTaskList(workspaceId);

        return this.asanaClient.getTasksFromUserTaskList(userTaskList.gid, this.taskFields);
    }

    constructor(private readonly editorClient: EditorClient) {
        super(editorClient);

        this.asanaClient = new AsanaClient(editorClient, MOCK_DATA);
    }

    public label: string = 'Asana';
    public itemLabel: string = 'Asana task';
    public itemsLabel: string = 'Asana tasks';
    public iconUrl: string =
        'https://cdn-cashy-static-assets.lucidchart.com/extensibility/packages/asana/Asana-Logo-for-card.svg';
    public dataConnectorName: string = 'asana';

    public showIntro?: (() => void) | undefined;

    public fieldConfiguration = {
        getAllFields: async (dataSource: DataSourceProxy) => {
            /**
             * In the Asana data connector, during an import, we import all custom fields on a task by default. Therefore,
             * the fields on the task collection represent all the Asana fields.
             */
            return (
                [...dataSource.collections.values()]
                    .find((collection) => collection.getSyncCollectionId() === TaskCollectionName)
                    ?.getFields() ?? []
            );
        },
        onSelectedFieldsChange: async (dataSource: DataSourceProxy, selectedFields: string[]) => {},

        fieldValueSearchCallbacks: new Map([[DefaultFieldNames.Assignee, this.userSearchCallback]]),
    };

    public getDefaultConfig = async (dataSource: DataSourceProxy) => {
        return {
            cardConfig: {
                fieldNames: [DefaultFieldNames.Name],
                fieldDisplaySettings: new Map([
                    [
                        'Completed',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.BasicTextBadge,
                                horizontalPosition: HorizontalBadgePos.LEFT,
                                backgroundColor: '=IF(@Completed, "#b8dedc", "#fff1aa")',
                                valueFormula:
                                    '=IF(ISNOTEMPTY(@Completed), IF(@Completed, "Complete", "Incomplete"), NONE)',
                            },
                        },
                    ],
                    [
                        'Assignee',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.UserProfile,
                                tooltipFormula: '=CONCATENATE("Assigned to ", @Assignee.name)',
                                valueFormula: '=OBJECT("iconUrl", @Assignee.iconUrl, "name", @Assignee.name)',
                            },
                        },
                    ],
                    [
                        'Id',
                        {
                            stencilConfig: {
                                displayType: FieldDisplayType.SquareImageBadge,
                                valueFormula:
                                    '="https://cdn-cashy-static-assets.lucidchart.com/extensibility/packages/asana/Asana-Logo-for-card.svg"',
                                onClickHandlerKey: OnClickHandlerKeys.OpenBrowserWindow,
                                linkFormula: '=@Permalink',
                                horizontalPosition: HorizontalBadgePos.RIGHT,
                                tooltipFormula:
                                    '=IF(ISNOTEMPTY(LASTSYNCTIME), "Last synced " & RELATIVETIMEFORMAT(LASTSYNCTIME), NONE)',
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
                        name: 'Name',
                        locked: true,
                    },
                    {
                        name: 'Assignee',
                        locked: true,
                    },
                    {
                        name: 'Completed',
                        locked: true,
                    },
                    {
                        name: 'Due Date',
                        locked: true,
                    },
                ],
            },
        };
    };

    public importModal = {
        /**
         * Given the values entered by the user so far into search fields, return the list of all search fields
         * to display in the search form.
         */
        getSearchFields: async (
            searchSoFar: Map<string, SerializedFieldType>,
        ): Promise<ExtensionCardFieldDefinition[]> => {
            const workspaces = await this.getWorkspaces();

            const fields: ExtensionCardFieldDefinition[] = [
                {
                    name: 'search',
                    label: 'Search',
                    type: ScalarFieldTypeEnum.STRING,
                },
                {
                    name: 'completed',
                    label: 'Status',
                    type: ScalarFieldTypeEnum.BOOLEAN,
                    constraints: [{type: FieldConstraintType.MAX_VALUE, value: 1}],
                    options: [
                        {label: 'Completed', value: true},
                        {label: 'Not Completed', value: false},
                    ],
                },
                {
                    name: 'workspace',
                    label: 'Workspace',
                    type: ScalarFieldTypeEnum.STRING,
                    default: workspaces[0]?.gid,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                    options: workspaces.map((workspace) => ({label: workspace.name, value: workspace.gid})),
                },
            ];

            const workspaceId = searchSoFar.get('workspace');
            if (isString(workspaceId)) {
                fields.push({
                    name: 'project',
                    label: 'Project',
                    type: new FieldTypeArray([ScalarFieldTypeEnum.STRING]),
                    search: this.projectSearchCallback,
                });
            }

            return fields;
        },

        /**
         * Given values entered by the user into the search fields so far, return a collection of data to
         * display in the results table.
         */
        search: async (
            fields: Map<string, SerializedFieldType>,
        ): Promise<{
            partialImportMetadata: {collectionId: string; syncDataSourceId?: string};
            data: CollectionDefinition;
            fields: ExtensionCardFieldDefinition[];
        }> => {
            const tasks = await this.getTaskList(fields);
            const workspaceId = fields.get('workspace') as string | undefined;
            return {
                data: {
                    schema: {
                        fields: [
                            {name: 'gid', type: ScalarFieldTypeEnum.STRING},
                            {
                                name: DefaultFieldNames.Name,
                                type: ScalarFieldTypeEnum.STRING,
                                mapping: [SemanticKind.Title],
                            },
                            {name: DefaultFieldNames.Assignee, type: ScalarFieldTypeEnum.STRING},
                            {name: DefaultFieldNames.Completed, type: ScalarFieldTypeEnum.BOOLEAN},
                            {name: DefaultFieldNames.DueDate, type: ScalarFieldTypeEnum.DATEONLY},
                        ],
                        primaryKey: ['gid'],
                    },
                    items: new Map(
                        tasks.map((task) => [
                            JSON.stringify(task.gid),
                            {
                                'gid': task.gid,
                                [DefaultFieldNames.Name]: task.name,
                                [DefaultFieldNames.Assignee]: task.assignee?.name,
                                [DefaultFieldNames.Completed]: task.completed,
                                [DefaultFieldNames.DueDate]: task.due_at
                                    ? {
                                          'isoDate': convertDueAtToDateonly(task.due_at),
                                      }
                                    : task.due_on
                                    ? {
                                          'isoDate': task.due_on,
                                      }
                                    : undefined,
                            },
                        ]),
                    ),
                },
                fields: [
                    {
                        name: DefaultFieldNames.Name,
                        label: 'Name',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                    {
                        name: DefaultFieldNames.Assignee,
                        label: 'Assignee',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                    {
                        name: DefaultFieldNames.Completed,
                        label: 'Completed',
                        type: ScalarFieldTypeEnum.BOOLEAN,
                    },
                    {
                        name: DefaultFieldNames.DueDate,
                        label: 'Due',
                        type: ScalarFieldTypeEnum.STRING,
                    },
                ],
                partialImportMetadata: {
                    collectionId: 'Tasks',
                    syncDataSourceId: workspaceId,
                },
            };
        },

        import: async (
            primaryKeys: string[],
            searchFields: Map<string, SerializedFieldType>,
        ): Promise<{collection: CollectionProxy; primaryKeys: string[]}> => {
            const workspaceId = searchFields.get('workspace');
            if (!isString(workspaceId) || !workspaceId) {
                throw new Error('No workspace selected');
            }
            this.updateDefaultCreationProjects(searchFields.get('project'));
            await this.editorClient.performDataAction({
                dataConnectorName: 'asana',
                syncDataSourceIdNonce: workspaceId,
                actionName: 'Import',
                actionData: {workspaceId, taskIds: primaryKeys.map((pk) => JSON.parse(pk))},
                asynchronous: true,
            });

            const collection = await this.editorClient.awaitDataImport('asana', workspaceId, 'Tasks', primaryKeys);

            return {collection, primaryKeys};
        },
    };

    public addCard = {
        /**
         * Given the values entered by the user so far into input fields, return the list of all input fields
         * to display in the create-card form.
         */
        getInputFields: async (
            inputSoFar: Map<string, SerializedFieldType>,
        ): Promise<ExtensionCardFieldDefinition[]> => {
            const workspaces = await this.getWorkspaces();

            const fields: ExtensionCardFieldDefinition[] = [
                {
                    name: DefaultFieldNames.Name,
                    label: 'Task name',
                    type: ScalarFieldTypeEnum.STRING,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                },
                {
                    name: 'workspace',
                    label: 'Workspace',
                    type: ScalarFieldTypeEnum.STRING,
                    default: workspaces[0]?.gid,
                    constraints: [{type: FieldConstraintType.REQUIRED}],
                    options: workspaces.map((workspace) => ({label: workspace.name, value: workspace.gid})),
                },
            ];

            const workspaceId = inputSoFar.get('workspace');
            if (isString(workspaceId)) {
                fields.push({
                    name: 'project',
                    label: 'Project',
                    type: new FieldTypeArray([ScalarFieldTypeEnum.STRING]),
                    constraints: [
                        //Not technically required, but for simplicity of UI & schema:
                        {type: FieldConstraintType.REQUIRED},
                    ],
                    search: this.projectSearchCallback,
                    default: [...this.defaultCreationProjects],
                });
            }

            return fields;
        },

        /**
         * Given the values entered by the user into input fields, create a new data record to represent the
         * created card, and return information about that record.
         */
        createCardData: async (
            input: Map<string, SerializedFieldType>,
        ): Promise<{collection: CollectionProxy; primaryKey: string}> => {
            const workspaceId = input.get('workspace');
            if (!isString(workspaceId) || !workspaceId) {
                throw new Error('No workspace selected');
            }
            this.updateDefaultCreationProjects(input.get('project'));
            let collection: CollectionProxy;
            try {
                //Short timeout: If we haven't done an import yet, this will fail pretty much immediately.
                //If we HAVE done an import it'll give the collection immediately.
                collection = await this.editorClient.awaitDataImport('asana', workspaceId, `Tasks`, [], 1);
            } catch {
                //If the import wasn't already ready, go ahead and import in the correct data source, but
                //an empty list of tasks. This will get the collection & source set up correctly.
                await this.editorClient.performDataAction({
                    dataConnectorName: 'asana',
                    syncDataSourceIdNonce: workspaceId,
                    actionName: 'Import',
                    actionData: {workspaceId, taskIds: []},
                    asynchronous: true,
                });
                collection = await this.editorClient.awaitDataImport('asana', workspaceId, 'Tasks', []);
            }

            const primaryKeys = collection.patchItems({
                added: [
                    {
                        'Projects': input.get('project'),
                        'Name': input.get(DefaultFieldNames.Name),
                        'Workspace': workspaceId,
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
