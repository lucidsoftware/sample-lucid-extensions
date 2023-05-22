import {Client as AsanaClient, resources} from 'asana';
import {CollectionEnumFieldNames, DataSourceClient, FieldTypeArray, ItemType} from 'lucid-extension-sdk';
import {TaskCollectionName} from '../../common/constants';
import {ProjectItemType, projectSchema} from '../collections/projectcollection';
import {SectionItemType, sectionSchema} from '../collections/sectioncollection';
import {taskSchema} from '../collections/taskcollection';
import {UserItemType, userSchema} from '../collections/usercollection';
import {lucidColor} from './colors';
import {getCustomFieldNames, getCustomFieldsSchema, getFormattedTask} from './fields';

const prepTaskData = (fullTaskData: resources.Tasks.Type[]) => {
    const foundUsers = new Map<string, UserItemType>();
    const foundProjects = new Map<string, ProjectItemType>();
    const foundSections = new Map<string, SectionItemType>();
    const foundCustomFields = new Set<string>();

    const tasks = fullTaskData.map((task) => {
        const formattedTask = getFormattedTask(task);
        getCustomFieldNames(task).forEach((fieldName) => foundCustomFields.add(fieldName));

        if (task.assignee) {
            foundUsers.set(task.assignee.gid, {
                [CollectionEnumFieldNames.Id]: task.assignee.gid,
                [CollectionEnumFieldNames.Name]: task.assignee.name,
                [CollectionEnumFieldNames.Description]: task.assignee.email ?? null,
                [CollectionEnumFieldNames.Color]: null,
                [CollectionEnumFieldNames.IconUrl]: task.assignee.photo?.['image_60x60'] ?? null,
            });
        }

        task.memberships.forEach((membership) => {
            foundProjects.set(membership.project.gid, {
                [CollectionEnumFieldNames.Id]: membership.project.gid,
                [CollectionEnumFieldNames.Name]: membership.project.name,
                //TODO: There are values we could potentially put in here, but would require another
                //call out to Asana to get those details. Projects have a specific color, for example.
                [CollectionEnumFieldNames.Description]: null,
                [CollectionEnumFieldNames.Color]:
                    lucidColor((membership.project as resources.Projects.Type)?.color) ?? null,
                [CollectionEnumFieldNames.IconUrl]: null,
                'Workspace': task.workspace.gid,
            });

            if (membership.section) {
                foundSections.set(membership.section.gid, {
                    [CollectionEnumFieldNames.Id]: membership.section.gid,
                    [CollectionEnumFieldNames.Name]: membership.section.name,
                    [CollectionEnumFieldNames.Description]: null,
                    [CollectionEnumFieldNames.Color]: null,
                    [CollectionEnumFieldNames.IconUrl]: null,
                    'Project': membership.project.gid,
                });
            }
        });

        return formattedTask;
    });

    return {tasks, foundUsers, foundProjects, foundSections, foundCustomFields};
};

/**
 * this is helpful to help typescript find a common type for the two arrays
 * even if b is less specific than a
 */
const concat = <T>(a: T[], b: T[]) => a.concat(b);

export const uploadTasks = async (
    client: DataSourceClient,
    workspaceId: string,
    fullTaskData: resources.Tasks.Type[],
    asanaClient: AsanaClient,
) => {
    const {tasks, foundUsers, foundProjects, foundSections, foundCustomFields} = prepTaskData(fullTaskData);

    await client.update({
        dataSourceName: 'Asana',
        collections: {
            [TaskCollectionName]: {
                schema: {
                    fields: concat(
                        taskSchema.array,
                        await getCustomFieldsSchema(workspaceId, foundCustomFields, asanaClient),
                    ),
                    primaryKey: taskSchema.primaryKey.elements,
                },
                patch: {
                    items: taskSchema.fromItems(tasks),
                },
            },
            // Users collection
            'Users': {
                schema: {
                    fields: userSchema.array,
                    primaryKey: userSchema.primaryKey.elements,
                },
                patch: {
                    items: userSchema.fromItems([...foundUsers.values()]),
                },
            },
            // Projects collection
            'Projects': {
                schema: {
                    fields: projectSchema.array,
                    primaryKey: projectSchema.primaryKey.elements,
                },
                patch: {
                    items: projectSchema.fromItems([...foundProjects.values()]),
                },
            },
            // Sections collection
            'Sections': {
                schema: {
                    fields: sectionSchema.array,
                    primaryKey: sectionSchema.primaryKey.elements,
                },
                patch: {
                    items: sectionSchema.fromItems([...foundSections.values()]),
                },
            },
        },
    });

    return {success: true};
};
