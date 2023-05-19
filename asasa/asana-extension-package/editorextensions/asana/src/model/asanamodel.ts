export interface ResourceCompact {
    gid: string;
    resource_type: string;
    name: string;
}

export interface TaskCompact extends ResourceCompact {
    resource_type: 'task';
}

export interface WorkspaceCompact extends ResourceCompact {
    resource_type: 'workspace';
}

export interface ProjectCompact extends ResourceCompact {
    resource_type: 'project';
}

export interface SectionCompact extends ResourceCompact {
    resource_type: 'section';
}

export interface Assignee extends ResourceCompact {
    resource_type: 'assignee';
}

export interface User extends ResourceCompact {
    resource_type: 'user';
    photo?: {
        'image_60x60': string;
    };
}

export interface Membership {
    project: ProjectCompact;
    section: SectionCompact;
}

export interface Task {
    gid: string;
    name: string;
    assignee: Assignee | undefined;
    completed: boolean;
    due_on: string | undefined;
    due_at: string | undefined;
}

export interface UserTaskList {
    gid: string;
    name: string;
}

export interface CustomField {
    gid: string;
    name: string;
}
