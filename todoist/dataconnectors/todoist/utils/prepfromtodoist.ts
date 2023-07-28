import {Task as TodoistTask, TodoistApi as TodoistClient} from '@doist/todoist-api-typescript';
import {isDefAndNotNull} from 'lucid-extension-sdk/core/checks';
import {getFormattedSection, getFormattedTask, getFormattedUser} from './fields';

export async function importTasks(taskIds: Set<string>, authorizedClient: TodoistClient): Promise<TodoistTask[]> {
    return await authorizedClient.getTasks({
        ids: [...taskIds],
    });
}

export function prepTaskData(fullTaskData: TodoistTask[]) {
    const userIds = new Set<string>();
    const sectionIds = new Set<string>();

    const formattedTasks = fullTaskData.map(getFormattedTask);
    fullTaskData.forEach((task) => {
        getTaskUsers(task).forEach((user) => userIds.add(user));
        if (task.sectionId) {
            sectionIds.add(task.sectionId);
        }
    });

    // The only case in which this wouldn't be defined would be for an empty import
    // In that case, we only create the tasks collection and set up its schema for bootstrapping purposes,
    // and the project id is not necessary for that
    const projectId = fullTaskData.pop()?.projectId;

    return {formattedTasks: formattedTasks, foundUsers: userIds, foundSections: sectionIds, projectId: projectId};
}
function getTaskUsers(fullTask: TodoistTask): Set<string> {
    const foundUsers: (string | null | undefined)[] = [];
    foundUsers.push(fullTask.assigneeId);
    foundUsers.push(fullTask.assignerId);
    foundUsers.push(fullTask.creatorId);
    return new Set(foundUsers.filter(isDefAndNotNull));
}
/**
 * Pulls user data from todoist. The only way to look up users through their API is by getting all of the users for
 * a project. So that's what we'll do, and then filter down to the ones that are actually relevant.
 */

export async function prepUsers(userIds: Set<string>, projectId: string, authorizedClient: TodoistClient) {
    const projectUsers = await authorizedClient.getProjectCollaborators(projectId);
    return projectUsers.filter((user) => userIds.has(user.id)).map(getFormattedUser);
}
/**
 * Pulls section data from todoist. Todoist's api doesn't have a good bulk lookup for these other than fetching all
 * of them for a project. Since they're so small it shouldn't be an issue.
 */

export async function prepSections(sectionIds: Set<string>, projectId: string, authorizedClient: TodoistClient) {
    const projectUsers = await authorizedClient.getSections(projectId);
    return projectUsers.filter((user) => sectionIds.has(user.id)).map(getFormattedSection);
}
