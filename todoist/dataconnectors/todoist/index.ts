import {DataConnectorAction} from 'lucid-extension-sdk/dataconnector/actions/action';
import {DataConnector} from 'lucid-extension-sdk/dataconnector/dataconnector';
import {DataConnectorClient} from 'lucid-extension-sdk/dataconnector/dataconnectorclient';
import {hardRefreshAction} from './actions/hardrefresh';
import {importAction} from './actions/import';
import {patchAction} from './actions/patch';
import {TodoistActionArgs} from './actions/todoistaction';
import todoist = require('@doist/todoist-api-typescript');


export const makeDataConnector = (
    dataConnectorClient: DataConnectorClient,
    lambdaUrl: string,
) => {

    /**
     * Decorates an action that expects an authorized Todoist client and
     * turns it into an action that authorizes at the beginning and passes
     * the client to the inner action definition
     */
    const authorized =
        <T extends DataConnectorAction, U>(func: (args: TodoistActionArgs<T>) => U) =>
        (action: T) =>
            func({action, todoistClient: new todoist.TodoistApi(action.context.userCredential), lambdaUrl});

    return new DataConnector(dataConnectorClient)
        .defineAction('Patch', authorized(patchAction))
        .defineAsynchronousAction('Import', authorized(importAction))
        .defineAsynchronousAction('HardRefresh', authorized(hardRefreshAction))
        .defineAsynchronousAction('Poll', authorized(hardRefreshAction));
};
