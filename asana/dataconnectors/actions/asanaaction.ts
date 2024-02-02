import {Client as AsanaClient} from 'asana';

export type AsanaActionArgs<Action> = {
    action: Action;
    asanaClient: AsanaClient;
};

export type AsanaAction<Action, Res = {success: boolean}> = (args: AsanaActionArgs<Action>) => Promise<Res>;
