import {DataConnectorAsynchronousAction} from 'lucid-extension-sdk';
import {CollectionName, DataSourceName} from '../../common/names';
import {ExternalExampleDataClient} from '../../data/exampleexternaldataclient';
import {exampleCollectionSchema, ExampleTaskType} from '../schema/examplecollectionschema';
import {fullTaskDataToLucidFormat} from '../schema/exampletaskutil';

export const importAction: (action: DataConnectorAsynchronousAction) => Promise<{success: boolean}> = async (
    action,
) => {
    const primaryKeys = (action.data as any).taskIds as string[];
    const itemsToAdd: ExampleTaskType[] = getTaskData(primaryKeys);

    action.client.update({
        dataSourceName: DataSourceName,
        collections: {
            [CollectionName]: {
                schema: {
                    fields: exampleCollectionSchema.array,
                    primaryKey: exampleCollectionSchema.primaryKey.elements,
                },
                patch: {
                    items: exampleCollectionSchema.fromItems(itemsToAdd),
                },
            },
        },
    });

    return {success: true};
};

const getTaskData = (ids: string[]) => {
    const extenalExampleDataClient = new ExternalExampleDataClient();
    const fullTaskData = extenalExampleDataClient.getExampleFullTaskData(ids);
    // Once we get the data from the external data source we need to convert it into a format the Lucid understands.
    const formattedTaskData = fullTaskData.map(fullTaskDataToLucidFormat);
    return formattedTaskData;
};
