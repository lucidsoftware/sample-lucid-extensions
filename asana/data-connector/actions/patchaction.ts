import {DataConnectorPatchAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {PatchChange} from 'lucid-extension-sdk/dataconnector/actions/patchresponsebody';
import {DataConnectorRunError} from 'lucid-extension-sdk/dataconnector/dataconnector';
import {getFormattedTask, lucidToAsanaCreationData, lucidToAsanaUpdateData} from '../utils/fields';
import {AsanaAction} from './asanaaction';

export const patchAction: AsanaAction<DataConnectorPatchAction, PatchChange[]> = async ({action, asanaClient}) => {
    return await Promise.all(
        action.patches.map(async (patch) => {
            const change = patch.getChange();
            await Promise.all([
                ...Object.entries(patch.itemsAdded).map(async ([oldPrimaryKey, additions]) => {
                    try {
                        const fixedAdditions = lucidToAsanaCreationData(additions);
                        if (fixedAdditions.workspace) {
                            const taskResponse = await asanaClient.tasks.create({
                                'workspace': fixedAdditions.workspace,
                                ...fixedAdditions,
                            });

                            change.collections.push({
                                collectionId: patch.syncCollectionId,
                                items: {[oldPrimaryKey]: getFormattedTask(taskResponse)},
                                itemsDeleted: [],
                            });
                        } else {
                            throw new DataConnectorRunError(400, 'No workspace provided');
                        }
                    } catch (err) {
                        change.setTooltipError(oldPrimaryKey, 'Failed to create task in Asana');
                        console.warn('Error creating item', err);
                    }
                }),
                ...Object.entries(patch.itemsChanged).map(async ([primaryKey, additions]) => {
                    try {
                        const asanaParams = await lucidToAsanaUpdateData(additions, primaryKey, asanaClient);
                        await asanaClient.tasks.update(JSON.parse(primaryKey) as string, asanaParams);
                    } catch (err) {
                        change.setTooltipError(primaryKey, 'Failed to update Asana');
                        console.warn('error patching', err);
                    }
                }),
            ]);
            return change;
        }),
    );
};
