import {SerializedLucidDateObject} from 'lucid-extension-sdk';
import {TaskFieldNames} from '../../common/names';

export const fullTaskDataToLucidFormat = (task: {
    id: string;
    name: string;
    complete: boolean;
    dueDate: string;
    cost: number;
}) => {
    {
        const date: SerializedLucidDateObject & {isDateOnly: true} = {
            isoDate: task['dueDate'],
            isDateOnly: true,
        };
        return {
            [TaskFieldNames.ID]: task['id'],
            [TaskFieldNames.NAME]: task['name'],
            [TaskFieldNames.COMPLETE]: task['complete'],
            [TaskFieldNames.DUE]: date,
            [TaskFieldNames.COST]: task['cost'],
        };
    }
};
