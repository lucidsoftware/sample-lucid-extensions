import {TodoistApi as TodoistClient} from '@doist/todoist-api-typescript';

export type TodoistActionArgs<Action> = {
    action: Action;
    todoistClient: TodoistClient;
    lambdaUrl: string;
};

export type TodoistAction<Action, Res = {success: boolean}> = (args: TodoistActionArgs<Action>) => Promise<Res>;
