import {DataConnectorAsynchronousAction, DataConnectorRunError, isString} from 'lucid-extension-sdk';
import {importTasks} from '../utils/importtasks';
import {uploadTasks} from '../utils/uploadtasks';
import {AsanaAction} from './asanaaction';

export const hardRefreshAction: AsanaAction<DataConnectorAsynchronousAction> = async ({action, asanaClient}) => {
    let taskIds: string[] = [];
    Object.keys(action.context.documentCollections).forEach((key) => {
        if (key.includes('Tasks')) {
            taskIds = taskIds.concat(
                action.context.documentCollections?.[key].map((taskId) => JSON.parse(taskId)).filter(isString),
            );
        }
    });

    if (taskIds.length == 0) {
        return {success: true};
    }

    const fullTaskData = await importTasks(new Set(taskIds), asanaClient);

    if (fullTaskData.length > 0) {
        return uploadTasks(action.client, fullTaskData[0].workspace.gid, fullTaskData, asanaClient);
    } else {
        throw new DataConnectorRunError(404, 'Attempted sync update on async action');
    }
};
