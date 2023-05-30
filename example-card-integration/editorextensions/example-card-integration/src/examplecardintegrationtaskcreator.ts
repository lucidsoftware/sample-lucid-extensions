import {
    CollectionProxy,
    EditorClient,
    ExtensionCardFieldDefinition,
    FieldConstraintType,
    ScalarFieldTypeEnum,
    SerializedFieldType,
} from 'lucid-extension-sdk';
import {CollectionName, DataAction, DataConnecorName, DataSourceName, TaskFieldNames} from '../../../common/names';

export class ExampleCardIntegerationTaskCreator {
    constructor(private readonly client: EditorClient) {}

    public async getInputFields(inputSoFar: Map<string, SerializedFieldType>): Promise<ExtensionCardFieldDefinition[]> {
        return [
            {
                name: TaskFieldNames.NAME,
                label: 'Task name',
                type: ScalarFieldTypeEnum.STRING,
                constraints: [{type: FieldConstraintType.REQUIRED}],
            },
            {
                name: TaskFieldNames.DUE,
                label: 'Due on',
                type: ScalarFieldTypeEnum.DATEONLY,
            },
            {
                name: TaskFieldNames.COMPLETE,
                label: 'Complete',
                type: ScalarFieldTypeEnum.BOOLEAN,
            },
            {
                name: TaskFieldNames.COST,
                label: 'Cost',
                type: ScalarFieldTypeEnum.NULL,
            },
        ];
    }

    public async createCardData(
        input: Map<string, SerializedFieldType>,
    ): Promise<{collection: CollectionProxy; primaryKey: string}> {
        let collection: CollectionProxy;
        try {
            // Check if the Tasks collection has already been created in the example-tasks-source data source,
            // with a 1ms timeout. If the collection doesn't exist yet, an exception will be thrown.
            collection = await this.client.awaitDataImport(DataConnecorName, DataSourceName, CollectionName, [], 1);
        } catch {
            // No collection exists yet. Ask the data connector to perform an import of an empty list of tasks,
            // ust to get the collection created along with whatever other metadata you might need to set up there.
            await this.client.performDataAction({
                dataConnectorName: DataConnecorName,
                syncDataSourceIdNonce: DataSourceName,
                actionName: DataAction.IMPORT,
                actionData: {taskIds: []},
                asynchronous: true,
            });

            // And now wait for that empty import to complete, getting a reference to the resulting collection.
            collection = await this.client.awaitDataImport(DataConnecorName, DataSourceName, CollectionName, []);
        }

        // Add a single record
        const primaryKeys = collection.patchItems({
            added: [
                {
                    [TaskFieldNames.NAME]: input.get(TaskFieldNames.NAME),
                    [TaskFieldNames.DUE]: input.get(TaskFieldNames.DUE),
                    [TaskFieldNames.COMPLETE]: input.get(TaskFieldNames.COMPLETE),
                    [TaskFieldNames.COST]: input.get(TaskFieldNames.COST),
                },
            ],
        });

        if (primaryKeys.length != 1) {
            throw new Error('Failed to add new card data');
        }

        return {collection, primaryKey: primaryKeys[0]};
    }
}
