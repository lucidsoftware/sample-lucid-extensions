import {DataConnector, DataConnectorClient} from 'lucid-extension-sdk';
import {DataAction} from '../common/names';
import {importAction} from './actions/importaction';
import {patchAction} from './actions/patchaction';

export const makeDataConnector = (client: DataConnectorClient) =>
    new DataConnector(client)
        .defineAsynchronousAction(DataAction.IMPORT, importAction)
        .defineAction(DataAction.PATCH, patchAction);
