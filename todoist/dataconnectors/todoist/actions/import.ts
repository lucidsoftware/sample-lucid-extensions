import {isString} from 'lucid-extension-sdk/core/checks';
import {arrayValidator} from 'lucid-extension-sdk/core/validators/validators';
import {DataConnectorAsynchronousAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {DataConnectorRunError} from 'lucid-extension-sdk/dataconnector/dataconnector';
import {importTasks} from '../utils/prepfromtodoist';
import {uploadTasks} from '../utils/uploadtasks';
import {TodoistAction} from './todoistaction';

const importActionValidator = arrayValidator(isString);

export const importAction: TodoistAction<DataConnectorAsynchronousAction> = async ({action, todoistClient}) => {
    if (!importActionValidator(action.data)) {
        throw new DataConnectorRunError(400, 'Expected body to be an array of strings!');
    }
    const fullTaskData = await importTasks(new Set(action.data), todoistClient);
    return await uploadTasks(action.client, fullTaskData, todoistClient);
};
