import {Task as TodoistTask, TodoistApi as TodoistClient} from '@doist/todoist-api-typescript';
import {DataSourceClient} from 'lucid-extension-sdk/dataconnector/datasourceclient';
import {sectionSchema} from '../collections/sectioncollection';
import {taskSchema} from '../collections/taskcollection';
import {userSchema} from '../collections/usercollection';
import {prepSections, prepTaskData, prepUsers} from './prepfromtodoist';

export async function uploadTasks(
    dataSourceClient: DataSourceClient,
    fullTaskData: TodoistTask[],
    authorizedClient: TodoistClient,
) {
    const {formattedTasks, foundUsers, foundSections, projectId} = prepTaskData(fullTaskData);

    if (projectId) {
        const formattedUsers = await prepUsers(foundUsers, projectId, authorizedClient);
        const formattedSections = await prepSections(foundSections, projectId, authorizedClient);

        await dataSourceClient.update({
            dataSourceName: 'Todoist',
            collections: {
                // Tasks collection
                'Tasks': {
                    schema: {
                        fields: taskSchema.array,
                        primaryKey: taskSchema.primaryKey.elements,
                    },
                    patch: {
                        items: taskSchema.fromItems(formattedTasks),
                    },
                },
                // Users collection
                'Users': {
                    schema: {
                        fields: userSchema.array,
                        primaryKey: userSchema.primaryKey.elements,
                    },
                    patch: {
                        items: userSchema.fromItems(formattedUsers),
                    },
                },
                // Sections collection
                'Sections': {
                    schema: {
                        fields: sectionSchema.array,
                        primaryKey: sectionSchema.primaryKey.elements,
                    },
                    patch: {
                        items: sectionSchema.fromItems(formattedSections),
                    },
                },
            },
        });
    }

    return {success: true};
}
