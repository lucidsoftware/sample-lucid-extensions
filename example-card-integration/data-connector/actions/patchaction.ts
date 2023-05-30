import {PatchChange, SerializedIsoDateObject} from 'lucid-extension-sdk';
import {DataConnectorPatchAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {TaskFieldNames} from '../../common/names';
import {ExternalExampleDataClient} from '../../data/exampleexternaldataclient';
import {ExampleTaskType} from '../schema/examplecollectionschema';
import {fullTaskDataToLucidFormat} from '../schema/exampletaskutil';

export const patchAction: (action: DataConnectorPatchAction) => Promise<PatchChange[]> = async (action) => {
    const extenalExampleDataClient = new ExternalExampleDataClient();
    return await Promise.all(
        action.patches.map(async (patch) => {
            const change = patch.getChange();
            await Promise.all([
                ...Object.entries(patch.itemsAdded).map(async ([oldPrimaryKey, additions]) => {
                    try {
                        const fixedAdditions = lucidToExampleTaskCreationData(additions);
                        const taskResponse = await extenalExampleDataClient.create(fixedAdditions);

                        change.collections.push({
                            collectionId: patch.syncCollectionId,
                            items: {[oldPrimaryKey]: fullTaskDataToLucidFormat(taskResponse)},
                            itemsDeleted: [],
                        });
                    } catch (err) {
                        change.setTooltipError(oldPrimaryKey, 'Failed to create task');
                        console.warn('Error creating item', err);
                    }
                }),
                ...Object.entries(patch.itemsChanged).map(async ([primaryKey, additions]) => {
                    try {
                        const updateDate = await lucidToExampleTaskUpdateData(additions, primaryKey);
                        await extenalExampleDataClient.update(updateDate);
                    } catch (err) {
                        change.setTooltipError(primaryKey, 'Failed to update task');
                        console.warn('error patching', err);
                    }
                }),
            ]);
            return change;
        }),
    );
};

/**
 * Converts data from Lucid's format to a format the external source requires for task creation.
 */
const lucidToExampleTaskCreationData = (data: Partial<ExampleTaskType>) => {
    if (!data.name) {
        throw new Error('Not enough data provided to create task');
    } else {
        return {
            [TaskFieldNames.NAME]: data.name,
            'dueDate': data.due ? (data.due as SerializedIsoDateObject).isoDate : undefined,
            [TaskFieldNames.COST]: data.cost,
            [TaskFieldNames.COMPLETE]: data.complete,
        };
    }
};

/**
 * Converts data from Lucid's format to a format the external source requires to update tasks.
 */
const lucidToExampleTaskUpdateData = (data: Partial<ExampleTaskType>, taskId: string) => {
    if (!data.id) {
        throw new Error('Not enough data provided to update task');
    } else {
        return {
            [TaskFieldNames.ID]: data.id,
            [TaskFieldNames.NAME]: data.name,
            'dueDate': data.due ? (data.due as SerializedIsoDateObject).isoDate : undefined,
            [TaskFieldNames.COST]: data.cost,
            [TaskFieldNames.COMPLETE]: data.complete,
        };
    }
};
