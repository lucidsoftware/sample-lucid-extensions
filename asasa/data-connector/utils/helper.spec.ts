import {Client as AsanaClient} from 'asana';
import 'jasmine';
import {
    CollectionEnumFieldType,
    CollectionPatch,
    DataSourceRequest,
    DataUpdateFilterType,
    FieldConstraintDefinition,
    FieldConstraintType,
    FieldTypeArray,
    MockDataConnectorClient,
    ScalarFieldTypeEnum,
    SchemaDefinition,
    SemanticKind,
    SerializedFields,
} from 'lucid-extension-sdk';
import {makeDataConnector} from '../index';

export function cleanModuleId(module: string) {
    const parts = module.split('specs.sh.runfiles/lucid/');
    if (parts[1]) {
        if (parts[1].endsWith('.js')) {
            return parts[1].substring(0, parts[1].length - 3) + '.ts';
        }
        return parts[1];
    }
    return module;
}

const getSchemas = () => {
    const lockedFieldConstraint: FieldConstraintDefinition = {type: FieldConstraintType.LOCKED};
    const userCollection = new CollectionEnumFieldType('Users');
    const userArray = new FieldTypeArray([userCollection]);
    const sectionArray = new FieldTypeArray([new CollectionEnumFieldType('Sections')]);
    const projectArray = new FieldTypeArray([new CollectionEnumFieldType('Projects')]);

    const sectionSchema: SchemaDefinition = {
        'fields': [
            {'name': 'id', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {'name': 'name', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {
                'name': 'description',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {'name': 'color', 'type': ScalarFieldTypeEnum.NULL, 'constraints': undefined, 'mapping': undefined},
            {
                'name': 'iconUrl',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {
                'name': 'Project',
                'type': new CollectionEnumFieldType('Projects'),
                'constraints': undefined,
                'mapping': undefined,
            },
        ],
        'primaryKey': ['id'],
    };

    const projectSchema: SchemaDefinition = {
        'fields': [
            {'name': 'id', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {'name': 'name', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {
                'name': 'description',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {
                'name': 'color',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {
                'name': 'iconUrl',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {
                'name': 'Workspace',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': undefined,
                'mapping': undefined,
            },
        ],
        'primaryKey': ['id'],
    };

    const userSchema: SchemaDefinition = {
        'fields': [
            {'name': 'id', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {'name': 'name', 'type': ScalarFieldTypeEnum.STRING, 'constraints': undefined, 'mapping': undefined},
            {
                'name': 'description',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
            {'name': 'color', 'type': ScalarFieldTypeEnum.NULL, 'constraints': undefined, 'mapping': undefined},
            {
                'name': 'iconUrl',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': undefined,
            },
        ],
        'primaryKey': ['id'],
    };

    const taskSchema: SchemaDefinition = {
        'fields': [
            {
                'name': 'Id',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': [lockedFieldConstraint],
                'mapping': [SemanticKind.Id],
            },
            {
                'name': 'Resource Type',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Approval Status',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Completed',
                'type': ScalarFieldTypeEnum.BOOLEAN,
                'constraints': undefined,
                'mapping': [SemanticKind.Status],
            },
            {
                'name': 'Completed At',
                'type': [ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Created At',
                'type': ScalarFieldTypeEnum.DATE,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Due Date',
                'type': [ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': [SemanticKind.EndTime],
            },
            {
                'name': 'Liked',
                'type': ScalarFieldTypeEnum.BOOLEAN,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Likes',
                'type': userArray,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Sections',
                'type': [sectionArray, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Modified At',
                'type': ScalarFieldTypeEnum.DATE,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Name',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': undefined,
                'mapping': [SemanticKind.Name, SemanticKind.Title],
            },
            {
                'name': 'Notes',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': [SemanticKind.Description],
            },
            {
                'name': 'Number of Likes',
                'type': ScalarFieldTypeEnum.NUMBER,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Resource Subtype',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Start Date',
                'type': [ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL],
                'constraints': undefined,
                'mapping': [SemanticKind.StartTime],
            },
            {
                'name': 'Assignee',
                'type': [userCollection, ScalarFieldTypeEnum.NULL],
                'constraints': [{'type': FieldConstraintType.MAX_VALUE, 'value': 1}],
                'mapping': [SemanticKind.Assignee],
            },
            {
                'name': 'Assignee Section',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Custom Fields',
                'type': new FieldTypeArray([ScalarFieldTypeEnum.STRING]),
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Followers',
                'type': userArray,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Parent',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Permalink',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': [lockedFieldConstraint],
                'mapping': [SemanticKind.URL],
            },
            {
                'name': 'Projects',
                'type': projectArray,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Tags',
                'type': new FieldTypeArray([ScalarFieldTypeEnum.STRING]),
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Workspace',
                'type': ScalarFieldTypeEnum.STRING,
                'constraints': [lockedFieldConstraint],
                'mapping': undefined,
            },
            {
                'name': 'Cost',
                'type': [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
                'constraints': [lockedFieldConstraint],
                'mapping': [],
            },
        ],
        'primaryKey': ['Id'],
    };

    return {tasks: taskSchema, users: userSchema, sections: sectionSchema, projects: projectSchema};
};
export const getAsanaStructuredData = (gid: string) => {
    if (gid === 'asana-gid-2') {
        return {
            'Id': 'asana-gid-2',
            'Resource Type': 'task',
            'Approval Status': null,
            'Completed': false,
            'Completed At': null,
            'Created At': {isoDate: undefined} as any,
            'Due Date': {isoDate: '2022-11-21'},
            'Liked': false,
            'Likes': [],
            'Sections': [],
            'Modified At': {isoDate: '2022-10-27T19:23:17.593Z'},
            'Name': 'name',
            'Notes': 'notes',
            'Number of Likes': 0,
            'Resource Subtype': 'default_task',
            'Start Date': {isoDate: '2022-11-15'},
            'Assignee': 'assignee-gid-1',
            'Assignee Section': null,
            'Custom Fields': ['Cost'],
            'Followers': [],
            'Parent': null,
            'Permalink': 'link1',
            'Projects': ['project-1'],
            'Tags': [],
            'Workspace': 'workspace-id-1',
            'Cost': '13',
        };
    }

    if (gid === 'asana-gid-3') {
        return {
            'Id': 'asana-gid-3',
            'Resource Type': 'task',
            'Approval Status': null,
            'Completed': true,
            'Completed At': null,
            'Created At': {'isoDate': undefined} as any,
            'Due Date': {'isoDate': '2022-11-21'},
            'Liked': false,
            'Likes': [],
            'Sections': [],
            'Modified At': {'isoDate': '2022-10-27T19:23:17.593Z'},
            'Name': 'name',
            'Notes': 'notes 111',
            'Number of Likes': 0,
            'Resource Subtype': 'default_task',
            'Start Date': {'isoDate': '2022-11-17'},
            'Assignee': 'assignee-gid-2',
            'Assignee Section': null,
            'Custom Fields': ['Cost'],
            'Followers': [],
            'Parent': null,
            'Permalink': 'link2',
            'Projects': ['project-1'],
            'Tags': [],
            'Workspace': 'workspace-id-1',
            'Cost': '20',
        };
    }

    if (gid === 'assignee-gid-1') {
        return {
            id: 'assignee-gid-1',
            name: 'assigneeName',
            description: null,
            color: null,
            iconUrl: null,
        };
    }

    if (gid === 'assignee-gid-2') {
        return {
            id: 'assignee-gid-2',
            name: 'other assigneeName',
            description: null,
            color: null,
            iconUrl: null,
        };
    }

    throw new Error('Unknown gid');
};
export function mockClientCreator() {
    const calls: {name: string; arguments: any}[] = [];
    let monotone = 1;
    return {
        calls,
        clientCreator: (credential: string) => {
            return {
                workspaces: {
                    findAll: async (...args) => {
                        calls.push({'name': 'workspaces.findAll', arguments: args});
                        return {};
                    },
                },
                projects: {
                    findByWorkspace: async (workspaceId: string, ...args) => {
                        calls.push({'name': 'projects.findByWorkspace', arguments: [workspaceId, ...args]});
                        return {};
                    },
                },
                webhooks: {
                    create: async (...args) => {
                        calls.push({'name': 'webhooks.create', arguments: args});
                        return {'gid': `webhook-id-${monotone++}`};
                    },
                    deleteById: async (...args) => {
                        calls.push({'name': 'webhooks.deleteById', arguments: args});
                        return {};
                    },
                },
                tasks: {
                    createInWorkspace: async (workspaceId: string, additions: any, ...args) => {
                        calls.push({'name': 'tasks.createInWorkspace', arguments: [workspaceId, additions, ...args]});
                        return {};
                    },

                    create: async (additions: any, ...args) => {
                        calls.push({'name': 'tasks.create', arguments: [additions, ...args]});
                        return {
                            'gid': `fake-new-task-id-${monotone++}`,
                            'memberships': [],
                            'permalink_url': 'link1',
                            'name': 'name',
                            'notes': 'notes',
                            'assignee': {'name': 'assigneeName'},
                            'completed': true,
                            'start_on': '2022-11-15',
                            'due_on': '2022-11-21',
                            'resource_type': 'task',
                            'approval_status': null,
                            'completedAt': null,
                            'createdAt': '2022-10-11T18:07:10.703Z',
                            'custom_fields': [
                                {
                                    'name': 'Cost',
                                    'display_value': '13',
                                },
                            ],
                            'followers': [],
                            'liked': false,
                            'likes': [],
                            'modified_at': '2022-10-27T19:23:17.593Z',
                            'num_likes': 0,
                            'parent': null,
                            'projects': [
                                {
                                    'gid': 'project-1',
                                },
                            ],
                            'resource_subtype': 'default_task',
                            'tags': [],
                            'workspace': {'gid': 'workspace-id-1'},
                        };
                    },

                    findByProject: async (projectId: string, ...args) => {
                        calls.push({'name': 'tasks.findByProject', arguments: [projectId, ...args]});
                        return {
                            'workspace': {'gid': 'workspace-id-1'},
                            'memberships': [],
                            'gid': 'asana-gid-2',
                            'permalink_url': 'link1',
                            'name': 'name',
                            'notes': 'notes',
                            'assignee': {'name': 'assigneeName'},
                            'completed': true,
                            'start_on': '2022-11-15',
                            'due_on': '2022-11-21',
                            'resource_type': 'task',
                            'approval_status': null,
                            'completedAt': null,
                            'createdAt': '2022-10-11T18:07:10.703Z',
                            'custom_fields': [
                                {
                                    'name': 'Cost',
                                    'display_value': '13',
                                },
                            ],
                            'followers': [],
                            'liked': false,
                            'likes': [],
                            'modified_at': '2022-10-27T19:23:17.593Z',
                            'num_likes': 0,
                            'parent': null,
                            'projects': [
                                {
                                    'gid': 'project-1',
                                },
                            ],
                            'resource_subtype': 'default_task',
                            'tags': [],
                        };
                    },

                    findById: async (taskId: string, ...args) => {
                        calls.push({'name': 'tasks.findById', arguments: [taskId, ...args]});
                        switch (taskId) {
                            default:
                            case 'task-1':
                                return {
                                    'gid': 'asana-gid-2',
                                    'resource_type': 'task',
                                    'approval_status': null,
                                    'completed': false,
                                    'completedAt': null,
                                    'createdAt': '2022-10-11T18:07:10.703Z',
                                    'custom_fields': [
                                        {
                                            'name': 'Cost',
                                            'display_value': '13',
                                        },
                                    ],
                                    'due_on': '2022-11-21',
                                    'followers': [],
                                    'liked': false,
                                    'likes': [],
                                    'memberships': [],
                                    'modified_at': '2022-10-27T19:23:17.593Z',
                                    'name': 'name',
                                    'notes': 'notes',
                                    'num_likes': 0,
                                    'parent': null,
                                    'permalink_url': 'link1',
                                    'projects': [
                                        {
                                            'gid': 'project-1',
                                        },
                                    ],
                                    'start_on': '2022-11-15',
                                    'assignee': {'name': 'assigneeName', 'gid': 'assignee-gid-1'},
                                    'resource_subtype': 'default_task',
                                    'tags': [],
                                    'workspace': {'gid': 'workspace-id-1'},
                                };

                            case 'task-2':
                                return {
                                    'workspace': {'gid': 'workspace-id-1'},
                                    'memberships': [],
                                    'gid': 'asana-gid-3',
                                    'permalink_url': 'link2',
                                    'name': 'name',
                                    'notes': 'notes 111',
                                    'assignee': {'name': 'other assigneeName', 'gid': 'assignee-gid-2'},
                                    'completed': true,
                                    'start_on': '2022-11-17',
                                    'due_on': '2022-11-21',
                                    'resource_type': 'task',
                                    'approval_status': null,
                                    'completedAt': '2022-11-11T18:07:10.703Z',
                                    'createdAt': '2022-10-11T18:07:10.703Z',
                                    'custom_fields': [
                                        {
                                            'name': 'Cost',
                                            'display_value': '20',
                                        },
                                    ],
                                    'followers': [],
                                    'liked': false,
                                    'likes': [],
                                    'modified_at': '2022-10-27T19:23:17.593Z',
                                    'num_likes': 0,
                                    'parent': null,
                                    'projects': [
                                        {
                                            'gid': 'project-1',
                                        },
                                    ],
                                    'tags': [],
                                    'resource_subtype': 'default_task',
                                };
                        }
                    },

                    update: async (taskId: string, additions: any, ...args) => {
                        calls.push({'name': 'tasks.update', arguments: [taskId, additions, ...args]});
                        return {};
                    },

                    delete: async (taskId: string, ...args) => {
                        calls.push({'name': 'tasks.delete', arguments: [taskId, ...args]});
                        return {};
                    },
                },

                customFields: {
                    getCustomFieldsForWorkspace: async (workspaceId: string, ...args) => {
                        calls.push({
                            'name': 'customFields.getCustomFieldsForWorkspace',
                            arguments: [workspaceId, ...args],
                        });
                        return {
                            'data': [],
                            nextPage: async () => {
                                return null;
                            },
                        };
                    },
                },
            } as AsanaClient;
        },
    };
}
export class RequestCollections {
    private schemas = getSchemas();

    public collectionPatches: Record<string, CollectionPatch> = {
        'Users': {
            patch: {items: new Map()},
            schema: this.schemas.users,
        },
        'Projects': {
            patch: {items: new Map()},
            schema: this.schemas.projects,
        },
        'Sections': {
            patch: {items: new Map()},
            schema: this.schemas.sections,
        },
        'Tasks': {
            patch: {items: new Map()},
            schema: this.schemas.tasks,
        },
    };
    public items(collection: string, ...primaryKeysAndItems: [string, SerializedFields][]): RequestCollections {
        for (const [pk, serializedFields] of primaryKeysAndItems) {
            this.collectionPatches[collection].patch.items.set(pk, serializedFields);
        }
        return this;
    }
    public tasks(...primaryKeysAndItems: [string, SerializedFields][]): RequestCollections {
        return this.items('Tasks', ...primaryKeysAndItems);
    }
    public sections(...primaryKeysAndItems: [string, SerializedFields][]): RequestCollections {
        return this.items('Sections', ...primaryKeysAndItems);
    }
    public users(...primaryKeysAndItems: [string, SerializedFields][]): RequestCollections {
        return this.items('Users', ...primaryKeysAndItems);
    }
    public projects(...primaryKeysAndItems: [string, SerializedFields][]): RequestCollections {
        return this.items('Projects', ...primaryKeysAndItems);
    }
}
export const successUpdateFunctionForWithExpectedRequest = (collections: Record<string, CollectionPatch>) => {
    return (request: DataSourceRequest) => {
        expect(request.dataSourceName).toEqual('Asana');
        expect(request.collections).toEqual(collections);
        return {data: {success: true}, status: 200};
    };
};
export class ActionTester {
    private asanaClient = mockClientCreator();
    private mockDataConnectorClient = new MockDataConnectorClient();
    private dataConnector = makeDataConnector(this.mockDataConnectorClient, this.asanaClient.clientCreator);

    public async expectAction({
        action,
        postedCollections,
        asanaCalls,
        documentCollections,
        expectedActionResult,
    }: {
        action: {name: string; data: unknown};
        documentCollections?: unknown;
        postedCollections?: Record<string, CollectionPatch>;
        asanaCalls: {name: string; arguments: any}[];
        expectedActionResult?: {status: number; body: unknown};
    }) {
        if (postedCollections) {
            this.mockDataConnectorClient.dataSourceClient.gotUpdate =
                successUpdateFunctionForWithExpectedRequest(postedCollections);
        }
        const result = await this.dataConnector.runAction(
            '',
            {'x-lucid-signature': '', 'x-lucid-rsa-nonce': ''},
            {
                action,
                'userCredential': 'Some User Credential',
                'dataConnectorName': 'asana',
                'packageId': 'some package id',
                'packageVersion': '2.2.2',
                documentCollections: documentCollections ?? {},
                'updateFilterType': DataUpdateFilterType.AllUpdates,
                'documentUpdateToken': 'DocumentUpdateToken',
            },
        );

        expect(this.asanaClient.calls).toEqual(asanaCalls);

        expect(result).toEqual(expectedActionResult ?? {status: 200, body: {success: true}});
    }
}
