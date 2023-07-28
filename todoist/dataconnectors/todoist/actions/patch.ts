import {DataConnectorPatchAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {PatchChange} from 'lucid-extension-sdk/dataconnector/actions/patchresponsebody';
import {
    getFormattedTask,
    lucidPatchToTodoistCreationData,
    lucidPatchToTodoistPatch,
    taskIsCompleted,
} from '../utils/fields';
import {TodoistAction} from './todoistaction';

export const patchAction: TodoistAction<DataConnectorPatchAction, PatchChange[]> = async ({action, todoistClient}) => {
    return await Promise.all(
        action.patches.map(async (patch) => {
            const change = patch.getChange();
            await Promise.all([
                ...Object.entries(patch.itemsAdded).map(async ([oldPrimaryKey, additions]) => {
                    try {
                        const formattedCreate = {
                            ...lucidPatchToTodoistCreationData(additions),
                        };
                        const taskResponse = await todoistClient.addTask(formattedCreate);
                        change.collections.push({
                            collectionId: patch.syncCollectionId,
                            items: {[oldPrimaryKey]: getFormattedTask(taskResponse)},
                            itemsDeleted: [],
                        });
                    } catch (err) {
                        change.setTooltipError(oldPrimaryKey, 'Failed to create task in Todoist');
                        console.error('Error creating item', err);
                    }
                }),
                ...Object.entries(patch.itemsChanged).map(async ([primaryKey, additions]) => {
                    try {
                        const todoistParams = await lucidPatchToTodoistPatch(additions);
                        const taskId = JSON.parse(primaryKey) as string;
                        await todoistClient.updateTask(taskId, todoistParams);
                        if (taskIsCompleted(additions)) {
                            await todoistClient.closeTask(taskId);
                        }
                    } catch (err) {
                        change.setTooltipError(primaryKey, 'Failed to update Todoist');
                        console.error('error patching', err);
                    }
                }),
            ]);
            return change;
        }),
    );
};
