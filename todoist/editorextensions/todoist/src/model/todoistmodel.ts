export interface Project {
    id: string;
    name: string;
    comment_count: number;
    order: number;
    color: string;
    is_shared: boolean;
    is_favorite: boolean;
    is_inbox_project: boolean;
    is_team_inbox: boolean;
    view_style: string;
    url: string;
    parent_id: string | null;
}

export interface TodoistDate {
    date: string;
    is_recurring: boolean;
    datetime: string;
    string: string;
    timezone: string;
}

export interface User {
    name: string;
    email: string;
    id: string;
}

export interface Task {
    id: string;
    creator_id: string;
    created_at: string;
    assignee_id: string;
    assigner_id: string;
    comment_count: number;
    is_completed: boolean;
    content: string;
    description: string;
    due: TodoistDate;
    labels: string[];
    order: number;
    priority: number;
    project_id: string;
    section_id: string;
    parent_id: string;
    url: string;
}
