import {
    CollectionDefinition,
    CollectionProxy,
    EditorClient,
    ExtensionCardFieldDefinition,
    FieldConstraintType,
    ScalarFieldTypeEnum,
    SemanticKind,
    SerializedFieldType,
} from 'lucid-extension-sdk';
import {CollectionName, DataAction, DataConnecorName, DataSourceName, TaskFieldNames} from '../../../common/names';
import {ExternalExampleDataClient} from '../../../data/exampleexternaldataclient';

export class ExampleCardIntegrationImportModal {
    constructor(private readonly client: EditorClient) {}

    private readonly extenalDataClient = new ExternalExampleDataClient();

    private readonly searchFieldName = 'search';
    private readonly completeFieldName = 'compete';

    public async getSearchFields(
        searchSoFar: Map<string, SerializedFieldType>,
    ): Promise<ExtensionCardFieldDefinition[]> {
        return [
            {
                name: this.searchFieldName,
                label: 'Search',
                type: ScalarFieldTypeEnum.STRING,
            },
            {
                name: this.completeFieldName,
                label: 'Status',
                type: ScalarFieldTypeEnum.BOOLEAN,
                constraints: [{type: FieldConstraintType.MAX_VALUE, value: 1}],
                default: false,
                options: [
                    {label: 'Completed', value: true},
                    {label: 'Not Completed', value: false},
                ],
            },
        ];
    }

    public async search(fields: Map<string, SerializedFieldType>): Promise<{
        partialImportMetadata?: {collectionId: string; syncDataSourceId?: string};
        data: CollectionDefinition;
        fields: ExtensionCardFieldDefinition[];
    }> {
        const complete = fields.get(this.completeFieldName) as boolean | undefined;
        const search = fields.get(this.searchFieldName) as string | undefined;

        const data = this.extenalDataClient.getExampleSearchData(complete, search);

        return {
            data: {
                schema: {
                    fields: [
                        {name: TaskFieldNames.ID, type: ScalarFieldTypeEnum.STRING},
                        {
                            name: TaskFieldNames.NAME,
                            type: ScalarFieldTypeEnum.STRING,
                            mapping: [SemanticKind.Title],
                        },
                        {
                            name: TaskFieldNames.COMPLETE,
                            type: ScalarFieldTypeEnum.BOOLEAN,
                        },
                    ],
                    primaryKey: [TaskFieldNames.ID],
                },
                items: new Map(
                    data.map((one) => [
                        // The key for a data item is its primary key field, JSON-stringified.
                        JSON.stringify(one.id),
                        one,
                    ]),
                ),
            },
            fields: [
                {
                    name: TaskFieldNames.NAME,
                    label: 'Name',
                    type: ScalarFieldTypeEnum.STRING,
                },
                {
                    name: TaskFieldNames.NAME,
                    label: 'Completed',
                    type: ScalarFieldTypeEnum.BOOLEAN,
                },
            ],
        };
    }

    public async import(
        primaryKeys: string[],
        searchFields: Map<string, SerializedFieldType>,
    ): Promise<{collection: CollectionProxy; primaryKeys: string[]}> {
        await this.client.performDataAction({
            dataConnectorName: DataConnecorName,
            syncDataSourceIdNonce: DataSourceName,
            actionName: DataAction.IMPORT,
            actionData: {taskIds: primaryKeys},
            asynchronous: true,
        });

        const collection = await this.client.awaitDataImport(
            DataConnecorName,
            DataSourceName,
            CollectionName,
            primaryKeys,
        );

        return {collection, primaryKeys};
    }
}
