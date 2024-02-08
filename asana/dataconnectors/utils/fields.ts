import {Client as AsanaClient, resources} from 'asana';
import {isDefAndNotNull} from 'lucid-extension-sdk/core/checks';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';
import {FieldConstraintType} from 'lucid-extension-sdk/core/data/serializedfield/serializedfielddefinition';
import {SerializedIsoDateObject} from 'lucid-extension-sdk/core/data/serializedfield/serializedfields';
import {FieldDefinition} from 'lucid-extension-sdk/data/schemadefinition';
import {DefaultFieldNames} from '../../common/fields';
import {TaskItemType} from '../collections/taskcollection';
import {asanaDate, getFormattedDateOrTime, getFormattedTime, getFormattedTimeOptional} from './date';

export const getFormattedTask = (task: resources.Tasks.Type) => {
    const defaultFieldValues = getDefaultFieldValues(task);
    const customFieldValues: Record<string, string | null> = {};

    task.custom_fields.forEach((customField) => {
        customFieldValues[customField.name] = customField.display_value;
    });
    return {...defaultFieldValues, ...customFieldValues};
};

export const getCustomFieldNames = (task: resources.Tasks.Type) => {
    const customFieldNames = new Set<string>();
    task.custom_fields.forEach((customField) => {
        customFieldNames.add(customField.name);
    });
    return customFieldNames;
};

const getCustomFieldsForWorkspace = async (workspaceId: string, asanaClient: AsanaClient) => {
    const customFieldsForWorkspace: string[] = [];
    let currentPageCustomFields: resources.ResourceList<resources.CustomFields.Type> | null =
        await asanaClient.customFields.getCustomFieldsForWorkspace(workspaceId, {limit: 100});
    while (currentPageCustomFields !== null) {
        currentPageCustomFields.data.forEach((currentPageCustomField) =>
            customFieldsForWorkspace.push(currentPageCustomField.name),
        );
        currentPageCustomFields = await currentPageCustomFields.nextPage();
    }
    return customFieldsForWorkspace;
};

export const getCustomFieldsSchema = async (
    workspaceId: string,
    customFieldsOnTasks: Set<string>,
    asanaClient: AsanaClient,
): Promise<FieldDefinition[]> => {
    const customFieldsForWorkspace = await getCustomFieldsForWorkspace(workspaceId, asanaClient);
    // There exists some custom fields are are specific to only projects & won't be returned in the getCustomFieldsForWorkspace
    // API call. We add those fields here.
    const customFieldNames = new Set(customFieldsForWorkspace.concat([...customFieldsOnTasks]));
    // Asana lets you have custom fields with the same name as internal fields. Therefore, for now we will remove them from
    // the custom fields list.
    Object.values(DefaultFieldNames).forEach(customFieldNames.delete, customFieldNames);
    const customFieldsArray: FieldDefinition[] = [...customFieldNames].map((field) => {
        return {
            name: field,
            type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
            constraints: [{type: FieldConstraintType.LOCKED}],
            mapping: [],
        };
    });
    return customFieldsArray;
};

const getDefaultFieldValues = (task: resources.Tasks.Type) => {
    return {
        [DefaultFieldNames.Id]: task.gid,
        [DefaultFieldNames.ResourceType]: task.resource_type,
        [DefaultFieldNames.ApprovalStatus]: task.approval_status ?? null,
        [DefaultFieldNames.Completed]: task.completed,
        [DefaultFieldNames.CompletedAt]: getFormattedTimeOptional(task.completed_at),
        [DefaultFieldNames.CreatedAt]: getFormattedTime(task.created_at),
        [DefaultFieldNames.DueDate]: getFormattedDateOrTime(task.due_on, task.due_at),
        [DefaultFieldNames.Liked]: task.liked,
        [DefaultFieldNames.Likes]: task.likes.map((like) => like.gid),
        [DefaultFieldNames.Sections]: task.memberships
            .map((membership) => membership.section?.gid)
            .filter(isDefAndNotNull),
        [DefaultFieldNames.ModifiedAt]: getFormattedTime(task.modified_at),
        [DefaultFieldNames.Name]: task.name,
        [DefaultFieldNames.Notes]: task.notes,
        [DefaultFieldNames.NumberOfLikes]: task.num_likes,
        [DefaultFieldNames.ResourceSubtype]: task.resource_subtype ?? null,
        [DefaultFieldNames.StartDate]: getFormattedDateOrTime(task.start_on, task.start_at),
        [DefaultFieldNames.Assignee]: task.assignee?.gid ?? null,
        [DefaultFieldNames.AssingeeSection]: task.assignee_section?.name ?? null,
        [DefaultFieldNames.CustomFields]: task.custom_fields.map((customFields) => customFields.name),
        [DefaultFieldNames.Followers]: task.followers.map((follower) => follower.gid),
        [DefaultFieldNames.Parent]: task.parent?.name ?? null,
        [DefaultFieldNames.Permalink]: task.permalink_url,
        [DefaultFieldNames.Projects]: task.projects.map((project) => project.gid),
        [DefaultFieldNames.Tags]: task.tags.map((tag) => tag.name),
        [DefaultFieldNames.Workspace]: task.workspace.gid,
    };
};

export async function lucidToAsanaUpdateData(
    data: Partial<TaskItemType>,
    taskId: string,
    asanaClient: AsanaClient,
): Promise<resources.Tasks.UpdateParams> {
    fixNullValues(data);
    let dueDate = data[DefaultFieldNames.DueDate] as SerializedIsoDateObject | null | undefined;
    let startDate = data[DefaultFieldNames.StartDate] as SerializedIsoDateObject | null | undefined;
    // Asana requires the due_at be present in the request if start_at is present.
    // Similarly, it requires due_on to be present in the request if start_on is present.
    if (startDate !== undefined) {
        if (dueDate === undefined) {
            // We need to fetch the dueDate from Asana
            const task = await asanaClient.tasks.findById(JSON.parse(taskId) as string);
            dueDate = getFormattedDateOrTime(task.due_on, task.due_at);
            if (!dueDate) {
                // If the Asana task doesn't have a due date then we set the due date to be the start date and not set
                // a start date. This is also what the Asana UI does. Ideally, we would lock the start date field to
                // prevent users from entering a start date until a due date has been entered.
                dueDate = startDate;
                startDate = undefined;
            }
        }
        if (startDate && dueDate) {
            // If the patch contains the due date we make the start date match its type so that we send the correct pair
            // of dates to Asana.
            startDate.displayTimezone = dueDate.displayTimezone;
        }
    }
    return lucidToAsana(data, dueDate, startDate);
}

export function lucidToAsanaCreationData(data: Partial<TaskItemType>): resources.Tasks.CreateParams {
    fixNullValues(data);
    const dueDate = data[DefaultFieldNames.DueDate] as SerializedIsoDateObject | null | undefined;
    const startDate = data[DefaultFieldNames.StartDate] as SerializedIsoDateObject | null | undefined;
    if (startDate && dueDate) {
        startDate.displayTimezone = dueDate.displayTimezone;
        // startDate.timezone = dueDate.timezone;
    }
    const workspaceId = data[DefaultFieldNames.Workspace] as string | undefined;
    return {'workspace': workspaceId, ...lucidToAsana(data, dueDate, startDate)};
}

function fixNullValues(data: Partial<TaskItemType>) {
    // When a field is set to null in the editor it gets serialized to the string below.
    // TODO DAPL-1240: This is going to be changed so that we just get null.
    const nullPlaceholder = 'HETXb;B;ps++Sw6e77[v86VOhY?<Y$$3q-P8*IF^';
    Object.values(DefaultFieldNames).forEach((fieldName) => {
        const test = data[fieldName];
        if (data[fieldName] === nullPlaceholder) {
            data[fieldName] = null as any;
        }
    });
}

function lucidToAsana(
    data: Partial<TaskItemType>,
    normalizedDueDate: SerializedIsoDateObject | null | undefined,
    normializedStartDate: SerializedIsoDateObject | null | undefined,
): resources.Tasks.CreateParams & resources.Tasks.UpdateParams {
    return {
        ...(asanaDate('due_', normalizedDueDate) as any), // The Asana library we use doesn't let due_at be null even though the Asana API does
        ...asanaDate('start_', normializedStartDate),
        'completed': data[DefaultFieldNames.Completed],
        'assignee': data[DefaultFieldNames.Assignee],
        'notes': data[DefaultFieldNames.Notes],
        'name': data[DefaultFieldNames.Name],
        'projects': data[DefaultFieldNames.Projects] as string[],
        //TODO: 'memberships' to assign sections
    };
}
