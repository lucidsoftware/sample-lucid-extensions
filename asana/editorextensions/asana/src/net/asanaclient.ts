import {EditorClient, HumanReadableError, isString, TextXHRResponse, XHRResponse} from 'lucid-extension-sdk';
import {
    CustomField,
    ProjectCompact,
    Task,
    TaskCompact,
    User,
    UserTaskList,
    WorkspaceCompact,
} from '../model/asanamodel';

export class AsanaClient {
    constructor(private readonly client: EditorClient, private readonly baseUrl = 'https://app.asana.com/api/1.0/') {}

    private readonly asana = 'asana';

    private parseAsAny(data: XHRResponse): any {
        switch (data.responseFormat) {
            case 'utf8':
                return JSON.parse(data.responseText) as any;
            case 'binary':
                return JSON.parse(data.responseData as any) as any;
        }
    }

    private async getAllPages(url: string) {
        if (url.includes('?')) {
            url += '&limit=100';
        } else {
            url += '?limit=100';
        }
        const data: any[] = [];

        do {
            const result = await this.makeGetRequest(url);
            const parsed = this.parseAsAny(result);

            if (parsed?.data) {
                data.push(...parsed.data);
            }

            url = parsed?.next_page?.uri;
        } while (url);

        return data;
    }

    private async makeGetRequest(url: string) {
        try {
            const response = await this.client.oauthXhr(this.asana, {
                url,
                method: 'GET',
                responseFormat: 'utf8',
            });
            return response;
        } catch (error) {
            console.log('Error:', error);
            throw this.errorFromResponse(error);
        }
    }

    private errorFromResponse(response: any) {
        try {
            if (response.status === 402) {
                return new HumanReadableError(
                    'This integration allows imports only from a premium Asana workspace. Additionally, the user must be a member of a premium team inside the workspace.',
                );
            }
            return new HumanReadableError(this.parseAsAny(response).errors[0].message);
        } catch (error) {
            return new Error(JSON.stringify(response));
        }
    }

    public async getWorkspaces(): Promise<WorkspaceCompact[]> {
        return (await this.getAllPages(`${this.baseUrl}workspaces`)) as WorkspaceCompact[];
    }

    public async typeaheadProjects(workspace: WorkspaceCompact | string, search: string): Promise<ProjectCompact[]> {
        const id = isString(workspace) ? workspace : workspace.gid;
        let response: TextXHRResponse;
        if (search == '') {
            response = await this.makeGetRequest(`${this.baseUrl}workspaces/${id}/projects?limit=20`);
        } else {
            response = await this.makeGetRequest(
                `${this.baseUrl}workspaces/${id}/typeahead?resource_type=project&query=${encodeURIComponent(
                    search,
                )}&count=20`,
            );
        }
        return this.parseAsAny(response).data as ProjectCompact[];
    }

    public async typeaheadUsers(workspace: WorkspaceCompact | string, search: string): Promise<User[]> {
        const id = isString(workspace) ? workspace : workspace.gid;
        let response: TextXHRResponse;
        if (search == '') {
            response = await this.makeGetRequest(
                `${this.baseUrl}users?workspace=${id}&limit=20&opt_fields=photo,name,resource_type`,
            );
        } else {
            response = await this.makeGetRequest(
                `${this.baseUrl}workspaces/${id}/typeahead?resource_type=user&query=${encodeURIComponent(
                    search,
                )}&count=20&opt_fields=photo,name,resource_type`,
            );
        }
        return this.parseAsAny(response).data as User[];
    }

    public async getProjects(workspace: WorkspaceCompact | string): Promise<ProjectCompact[]> {
        const id = isString(workspace) ? workspace : workspace.gid;
        return (await this.getAllPages(`${this.baseUrl}workspaces/${id}/projects`)) as ProjectCompact[];
    }

    public async getTasks(project: ProjectCompact): Promise<TaskCompact[]> {
        const response = await this.makeGetRequest(`${this.baseUrl}projects/${project.gid}/tasks?limit=50`);
        return this.parseAsAny(response).data as TaskCompact[];
    }

    public async searchTasks(params: {
        workspaceId: string;
        searchQuery: string;
        projectIds?: string[];
        completed?: boolean;
        fields: string[];
    }): Promise<Task[]> {
        const projectQuery = params.projectIds ? `&projects.any=${params.projectIds.join(',')}` : '';
        const completedQuery = params.completed !== undefined ? '&completed=' + params.completed : '';
        const response = await this.makeGetRequest(
            `${this.baseUrl}workspaces/${params.workspaceId}/tasks/search?text=${encodeURIComponent(
                params.searchQuery,
            )}${projectQuery}${completedQuery}&limit=50&opt_fields=${params.fields.join(',')}`,
        );
        return this.parseAsAny(response).data as Task[];
    }

    public async getCustomFields(workspaceId: string) {
        const response = await this.makeGetRequest(`${this.baseUrl}workspaces/${workspaceId}/custom_fields`);
        return this.parseAsAny(response).data as CustomField[];
    }

    /**
     * Retrieves the user task list of the authenticated user
     * https://developers.asana.com/docs/get-a-user-task-list
     */
    public async getUserTaskList(workspaceId: string): Promise<UserTaskList> {
        const response = await this.makeGetRequest(`${this.baseUrl}users/me/user_task_list?workspace=${workspaceId}`);
        return this.parseAsAny(response).data as UserTaskList;
    }

    /**
     * Retrieves the task of a given user task list
     * https://developers.asana.com/docs/get-tasks-from-a-user-task-list
     */
    public async getTasksFromUserTaskList(userTaskListGid: string, fields: string[]): Promise<Task[]> {
        const response = await this.makeGetRequest(
            `${this.baseUrl}user_task_lists/${userTaskListGid}/tasks?opt_fields=${fields.join(',')}`,
        );
        return this.parseAsAny(response).data as Task[];
    }
}
