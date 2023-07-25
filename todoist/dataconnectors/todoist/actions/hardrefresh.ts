import {isString} from 'lucid-extension-sdk/core/checks';
import {DataConnectorAsynchronousAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {importTasks} from '../utils/prepfromtodoist';
import {uploadTasks} from '../utils/uploadtasks';
import {TodoistActionArgs} from './todoistaction';

export const hardRefreshAction = async ({
    action,
    todoistClient,
}: TodoistActionArgs<DataConnectorAsynchronousAction>): Promise<{success: boolean}> => {
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

    const fullTaskData = await importTasks(new Set(taskIds), todoistClient);

    return uploadTasks(action.client, fullTaskData, todoistClient);
};
