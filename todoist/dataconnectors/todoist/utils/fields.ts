import {
    AddTaskArgs as TodoistAddTaskArgs,
    DueDate as TodoistDueDate,
    Section as TodoistSection,
    Task as TodoistTask,
    UpdateTaskArgs as TodoistUpdateTaskArgs,
    User as TodoistUser,
} from '@doist/todoist-api-typescript';
import {SerializedLucidDateObject} from 'lucid-extension-sdk/core/data/serializedfield/serializedfields';
import {DefaultFieldNames} from '../../../common/fields';
import {SectionItemType} from '../collections/sectioncollection';
import {TaskItemType} from '../collections/taskcollection';
import {UserItemType} from '../collections/usercollection';

function getFormattedDueDate(dueDate: TodoistDueDate): SerializedLucidDateObject | null {
    const dateToUse = dueDate.datetime || dueDate.date;
    if (dateToUse) {
        return getFormattedDate(dateToUse, dueDate.timezone);
    }
    return null;
}

function getFormattedDate(dateString: string, timezone?: string | null): SerializedLucidDateObject {
    const ms = Date.parse(dateString);
    return {
        ms: ms,
    };
}

export function getFormattedTask(task: TodoistTask): TaskItemType {
    return {
        [DefaultFieldNames.Id]: task.id,
        [DefaultFieldNames.Project]: task.projectId,
        [DefaultFieldNames.Section]: task.sectionId || null,
        [DefaultFieldNames.Content]: task.content,
        [DefaultFieldNames.Description]: task.description,
        [DefaultFieldNames.Completed]: task.isCompleted,
        [DefaultFieldNames.Labels]: task.labels,
        [DefaultFieldNames.Parent]: task.parentId || null,
        [DefaultFieldNames.Order]: task.order,
        [DefaultFieldNames.Priority]: task.priority,
        [DefaultFieldNames.Due]: task.due ? getFormattedDueDate(task.due) : null,
        [DefaultFieldNames.Link]: task.url,
        [DefaultFieldNames.NumberOfComments]: task.commentCount,
        [DefaultFieldNames.CreatedAt]: getFormattedDate(task.createdAt, task.due?.timezone),
        [DefaultFieldNames.Creator]: task.creatorId,
        [DefaultFieldNames.Assignee]: task.assigneeId || null,
        [DefaultFieldNames.Assinger]: task.assignerId || null,
    };
}

export function getFormattedUser(user: TodoistUser): UserItemType {
    return {
        id: user.id,
        name: user.name,
        description: user.email,
    };
}

export function getFormattedSection(section: TodoistSection): SectionItemType {
    return {
        id: section.id,
        name: section.name,
        Order: section.order,
    };
}

export function lucidPatchToTodoistCreationData(data: Partial<TaskItemType>): TodoistAddTaskArgs {
    const {content, dueDate, dueString, dueLang, dueDatetime, assigneeId, ...otherFields} =
        lucidPatchToTodoistPatch(data);
    return {
        projectId: data[DefaultFieldNames.Project],
        content: content ?? '', // Todoist requires this to be defined, and it should be unless the client messed up
        parentId: data[DefaultFieldNames.Parent] ?? undefined,
        order: data[DefaultFieldNames.Order],
        dueDate: dueDate ?? undefined, // The rest of these need to be undefined instead of null for creation
        dueString: dueString ?? undefined,
        dueDatetime: dueDatetime ?? undefined,
        assigneeId: assigneeId ?? undefined,
        ...otherFields,
    };
}

export function taskIsCompleted(data: Partial<TaskItemType>): boolean | undefined {
    return data[DefaultFieldNames.Completed];
}

function lucidDateToTodoistDate(date: SerializedLucidDateObject): string {
    if ('ms' in date) {
        return new Date(date.ms).toUTCString();
    }
    return new Date(date.isoDate).toUTCString();
}

export function lucidPatchToTodoistPatch(data: Partial<TaskItemType>): TodoistUpdateTaskArgs {
    const dueDate = data[DefaultFieldNames.Due] as SerializedLucidDateObject | null | undefined;

    return {
        'content': data[DefaultFieldNames.Content],
        'description': data[DefaultFieldNames.Description],
        'labels': data[DefaultFieldNames.Labels],
        'priority': data[DefaultFieldNames.Priority],
        'dueDatetime': dueDate ? lucidDateToTodoistDate(dueDate) : undefined, // Todoist requires consistent use of which "date" format you provide, so we use the date time version
        'assigneeId': data[DefaultFieldNames.Assignee],
    };
}
