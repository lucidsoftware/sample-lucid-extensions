import {Client as AsanaClient} from 'asana';
import {
    DataConnector,
    DataConnectorAction,
    DataConnectorClient,
    DataConnectorRunError,
    isNumber,
    isObject,
} from 'lucid-extension-sdk';
import {AsanaActionArgs} from './actions/asanaaction';
import {hardRefreshAction} from './actions/hardrefreshaction';
import {importAction} from './actions/importaction';
import {patchAction} from './actions/patchaction';
import {defaultClientCreator} from './utils/asanaclientcreator';

export const makeDataConnector = (
    dataConnectorClient: DataConnectorClient,
    clientCreator: (credential: string) => AsanaClient = defaultClientCreator,
): DataConnector => {
    /**
     * decorates a action that expects an authorized asana client and
     * turns it into an action that authorizes at the beginning and passes
     * the client to the inner action definition
     */
    const authorized =
        <T extends DataConnectorAction, U>(func: (args: AsanaActionArgs<T>) => Promise<U>) =>
        (action: T) =>
            func({action, asanaClient: clientCreator(action.context.userCredential)});

    const withRateLimitHandling =
        <T, R>(func: (args: T) => Promise<R>) =>
        async (args: T) => {
            try {
                return await func(args);
            } catch (e: unknown) {
                const isRateLimitError =
                    (hasStatus(e) && e.status === 429) ||
                    (e instanceof Error && e.message.includes(`RateLimitEnforced`));
                if (isRateLimitError) {
                    throw new DataConnectorRunError(429, 'Hit Asana rate limit.');
                } else {
                    throw e;
                }
            }
        };
    return new DataConnector(dataConnectorClient)
        .defineAsynchronousAction('Import', authorized(withRateLimitHandling(importAction)))
        .defineAction('Patch', authorized(withRateLimitHandling(patchAction)))
        .defineAsynchronousAction('HardRefresh', authorized(withRateLimitHandling(hardRefreshAction)));
};

function hasStatus(e: unknown): e is {status: number} {
    return isObject(e) && isNumber(e.status);
}
