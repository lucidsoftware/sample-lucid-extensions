import "jasmine";
import {ActionTester, cleanModuleId, getAsanaStructuredData, RequestCollections} from '../utils/helper.test';
import {optFields} from '../utils/importtasks';

describe(cleanModuleId(module.id), () => {
    it('imports a single task from id', async () => {
        await new ActionTester().expectAction({
            action: {name: 'Import', data: {workspaceId: 'workspace-id-1', taskIds: ['task-1', 'task-2']}},
            postedCollections: new RequestCollections()
                .users(
                    ['"assignee-gid-1"', getAsanaStructuredData('assignee-gid-1')],
                    ['"assignee-gid-2"', getAsanaStructuredData('assignee-gid-2')],
                )
                .tasks(
                    ['"asana-gid-2"', getAsanaStructuredData('asana-gid-2')],
                    ['"asana-gid-3"', getAsanaStructuredData('asana-gid-3')],
                ).collectionPatches,
            asanaCalls: [
                {
                    name: 'tasks.findById',
                    arguments: ['task-1', {'opt_fields': optFields}],
                },
                {
                    name: 'tasks.findById',
                    arguments: ['task-2', {'opt_fields': optFields}],
                },
                {
                    name: 'customFields.getCustomFieldsForWorkspace',
                    arguments: ['workspace-id-1', {'limit': 100}],
                },
            ],
        });
    });

    it('hard refresh checks tracked ids', async () => {
        await new ActionTester().expectAction({
            action: {name: 'HardRefresh', data: null},
            documentCollections: {'Tasks': ['"task-1"']},
            postedCollections: new RequestCollections()
                .users(['"assignee-gid-1"', getAsanaStructuredData('assignee-gid-1')])
                .tasks(['"asana-gid-2"', getAsanaStructuredData('asana-gid-2')]).collectionPatches,
            asanaCalls: [
                {
                    name: 'tasks.findById',
                    arguments: ['task-1', {'opt_fields': optFields}],
                },
                {
                    name: 'customFields.getCustomFieldsForWorkspace',
                    arguments: ['workspace-id-1', {'limit': 100}],
                },
            ],
        });
    });
});
