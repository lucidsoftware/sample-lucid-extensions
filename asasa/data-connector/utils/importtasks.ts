import {Client as AsanaClient, resources} from 'asana';

export const optFields =
    'gid,resource_type,permalink_url,assingee_section,resource_subtype,created_at,completed,completed_at,custom_fields,due_on,due_at,followers,liked,likes,modified_at,name,notes,num_likes,parent.name,projects,start_on,start_at,workspace.name,tags,memberships.project.name,memberships.project.color,memberships.section.name,assignee.gid,assignee.name,assignee.email,assignee.photo';

export async function importTasks(taskIds: Set<string>, asanaClient: AsanaClient): Promise<resources.Tasks.Type[]> {
    const fullTaskData = Array.from(taskIds, async (taskId) => {
        const fullTaskData = await asanaClient.tasks.findById(taskId, {
            'opt_fields': optFields,
        });
        return fullTaskData;
    });
    return Promise.all(fullTaskData);
}
