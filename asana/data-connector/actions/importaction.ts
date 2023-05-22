import {DataConnectorAsynchronousAction, DataConnectorRunError} from 'lucid-extension-sdk';
import {importTasks} from '../utils/importtasks';
import {uploadTasks} from '../utils/uploadtasks';
import {importBodyValidator} from '../utils/validators';
import {AsanaAction} from './asanaaction';

export const importAction: AsanaAction<DataConnectorAsynchronousAction> = async ({action, asanaClient}) => {
    if (!importBodyValidator(action.data)) {
        throw new DataConnectorRunError(404, 'Body must be of type {workspaceId:string, taskIds:string[]}');
    }

    const {workspaceId, taskIds} = action.data;
    const fullTaskData = await importTasks(new Set(taskIds), asanaClient);
    return await uploadTasks(action.client, workspaceId, fullTaskData, asanaClient);
};
