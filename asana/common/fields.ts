/**
 * These are fields that are present on Asana tasks by default.
 * This list ignores deprecated fields & opt in fields.
 * https://developers.asana.com/docs/task
 */
export enum DefaultFieldNames {
    Id = 'Id',
    ResourceType = 'Resource Type',
    ApprovalStatus = 'Approval Status',
    Completed = 'Completed',
    CompletedAt = 'Completed At',
    CreatedAt = 'Created At',
    DueDate = 'Due Date',
    Liked = 'Liked',
    Likes = 'Likes',
    Sections = 'Sections',
    ModifiedAt = 'Modified At',
    Name = 'Name',
    Notes = 'Notes',
    NumberOfLikes = 'Number of Likes',
    ResourceSubtype = 'Resource Subtype',
    StartDate = 'Start Date',
    Assignee = 'Assignee',
    AssingeeSection = 'Assignee Section',
    CustomFields = 'Custom Fields',
    Followers = 'Followers',
    Parent = 'Parent',
    Permalink = 'Permalink',
    Projects = 'Projects',
    Tags = 'Tags',
    Workspace = 'Workspace',
    // CompletedBy = 'Completed By', // Not supported by the Asana library we are using
}
