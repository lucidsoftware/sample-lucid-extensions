import {EditorClient, HumanReadableError, XHRResponse} from 'lucid-extension-sdk';
import {Project, Task, User} from '../model/todoistmodel';

export class TodoistClient {
    constructor(private readonly client: EditorClient, private readonly baseUrl = 'https://api.todoist.com/rest/v2/') {}

    private readonly todoistOAuthProviderName = 'todoist';

    public async getProjects(): Promise<Project[]> {
        const rawResponse = await this.makeGetRequest(`${this.baseUrl}projects`);
        return this.parseAsAny(rawResponse) as Project[];
    }

    public async getProjectUsers(projectId: string): Promise<User[]> {
        const rawResponse = await this.makeGetRequest(`${this.baseUrl}projects/${projectId}/collaborators`);
        return this.parseAsAny(rawResponse) as User[];
    }

    public async getTasks(projectId: string, search?: string): Promise<Task[]> {
        const filterParam = search ? encodeURI(`&filter=search:${search}`) : '';
        const rawResponse = await this.makeGetRequest(`${this.baseUrl}tasks?project_id=${projectId}${filterParam}`);
        return this.parseAsAny(rawResponse) as Task[];
    }

    private async makeGetRequest(url: string) {
        try {
            const response = await this.client.oauthXhr(this.todoistOAuthProviderName, {
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
            return new HumanReadableError(this.parseAsAny(response).errors[0].message);
        } catch (error) {
            return new Error(JSON.stringify(response));
        }
    }

    private parseAsAny(data: XHRResponse): any {
        switch (data.responseFormat) {
            case 'utf8':
                return JSON.parse(data.responseText) as any;
            case 'binary':
                return JSON.parse(data.responseData as any) as any;
        }
    }
}
