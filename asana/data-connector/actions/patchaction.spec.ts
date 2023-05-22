import {ActionTester, cleanModuleId} from '../utils/helper.test';

describe(cleanModuleId(module.id), () => {
    it('applies a patch', async () => {
        await new ActionTester().expectAction({
            action: {
                name: 'Patch',
                data: [
                    {
                        'userCredential': 'totally valid user credential',
                        'packageVersion': '1.1.1',
                        'patches': [
                            {
                                'patch': {
                                    'itemsAdded': {
                                        '"1111"': {
                                            'Workspace': 'workspace-id-1',
                                            'Start Date': {'isoDate': '2019-09-14T17:08:52.000Z'},
                                        },
                                    },
                                    'itemsChanged': {
                                        '"2222"': {
                                            'Assignee': 'Fudge@example.com',
                                        },
                                    },
                                    'itemsDeleted': ['"3333"'],
                                    'syncSourceId': 'someSyncSourceId1',
                                    'syncCollectionId': 'Tasks',
                                    'adapterType': 'EXTENSION_API',
                                    'syncSchema': 'something',
                                },
                                'id': 'patch 1',
                            },
                        ],
                    },
                ],
            },
            asanaCalls: [
                {
                    name: 'tasks.create',
                    arguments: [
                        {
                            start_at: '2019-09-14T17:08:52.000Z',
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                            workspace: 'workspace-id-1',
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        '2222',
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: 'Fudge@example.com',
                            notes: undefined,
                            name: undefined,
                        },
                    ],
                },
            ],
            expectedActionResult: {
                status: 200,
                body: {
                    changes: [
                        {
                            syncId: 'someSyncSourceId1',
                            collections: [
                                {
                                    collectionId: 'Tasks',
                                    itemsPatch: {
                                        items: {
                                            '"1111"': {
                                                'Id': 'fake-new-task-id-1',
                                                'Name': 'name',
                                                'Notes': 'notes',
                                                'Assignee': null,
                                                'Completed': true,
                                                'Permalink': 'link1',
                                                'Start Date': {'isoDate': '2022-11-15'},
                                                'Due Date': {'isoDate': '2022-11-21'},
                                                'Projects': ['project-1'],
                                                'Sections': [],
                                                'Resource Type': 'task',
                                                'Approval Status': null,
                                                'Completed At': null,
                                                'Created At': {'isoDate': undefined},
                                                'Liked': false,
                                                'Likes': [],
                                                'Modified At': {'isoDate': '2022-10-27T19:23:17.593Z'},
                                                'Number of Likes': 0,
                                                'Resource Subtype': 'default_task',
                                                'Assignee Section': null,
                                                'Custom Fields': ['Cost'],
                                                'Followers': [],
                                                'Parent': null,
                                                'Tags': [],
                                                'Workspace': 'workspace-id-1',
                                                'Cost': '13',
                                            },
                                        },
                                        itemsDeleted: [],
                                    },
                                },
                            ],
                        },
                    ],
                    errors: {},
                },
            },
        });
    });

    it('applies three patches', async () => {
        await new ActionTester().expectAction({
            action: {
                name: 'Patch',
                data: [
                    {
                        'userCredential': 'totally valid user credential',
                        'packageVersion': '1.1.1',
                        'patches': [
                            {
                                'patch': {
                                    'itemsAdded': {'"1111"': {'Workspace': 'workspace-id-1'}},
                                    'itemsChanged': {
                                        '"2222"': {
                                            'Assignee': 'Fudge@example.com',
                                        },
                                    },
                                    'itemsDeleted': ['"3333"'],
                                    'syncSourceId': 'someSyncSourceId1',
                                    'syncCollectionId': 'Tasks',
                                    'adapterType': 'EXTENSION_API',
                                    'syncSchema': 'something',
                                },
                                'id': 'patch 1',
                            },
                            {
                                'patch': {
                                    'itemsAdded': {'"4444"': {'Workspace': 'workspace-id-1'}},
                                    'itemsChanged': {
                                        '"5555"': {'Start Date': {'ms': 1568437200000, isDateOnly: true}},
                                    },
                                    'itemsDeleted': ['"6666"'],
                                    'syncSourceId': 'someSyncSourceId2',
                                    'syncCollectionId': 'Tasks',
                                    'adapterType': 'EXTENSION_API',
                                    'syncSchema': 'something',
                                },
                                'id': 'patch 2',
                            },
                            {
                                'patch': {
                                    'itemsAdded': {'"7777"': {'Workspace': 'workspace-id-1'}},
                                    'itemsChanged': {'"8888"': {'Name': 'The Durpling'}},
                                    'itemsDeleted': ['"9999"'],
                                    'syncSourceId': 'someSyncSourceId3',
                                    'syncCollectionId': 'Tasks',
                                    'adapterType': 'EXTENSION_API',
                                    'syncSchema': 'something',
                                },
                                'id': 'patch 3',
                            },
                        ],
                    },
                ],
            },
            asanaCalls: [
                {
                    name: 'tasks.create',
                    arguments: [
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                            workspace: 'workspace-id-1',
                        },
                    ],
                },
                {
                    name: 'tasks.create',
                    arguments: [
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                            workspace: 'workspace-id-1',
                        },
                    ],
                },
                {name: 'tasks.findById', arguments: ['5555']},
                {
                    name: 'tasks.create',
                    arguments: [
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                            workspace: 'workspace-id-1',
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        '2222',
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: 'Fudge@example.com',
                            notes: undefined,
                            name: undefined,
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        '8888',
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: 'The Durpling',
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        '5555',
                        {
                            projects: undefined,
                            due_on: '2022-11-21',
                            start_on: '2019-09-14',
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                        },
                    ],
                },
            ],
            expectedActionResult: {
                status: 200,
                body: {
                    changes: [
                        {
                            syncId: 'someSyncSourceId1',
                            collections: [
                                {
                                    collectionId: 'Tasks',
                                    itemsPatch: {
                                        items: {
                                            '"1111"': {
                                                'Id': 'fake-new-task-id-1',
                                                'Name': 'name',
                                                'Notes': 'notes',
                                                'Assignee': null,
                                                'Completed': true,
                                                'Permalink': 'link1',
                                                'Start Date': {'isoDate': '2022-11-15'},
                                                'Due Date': {'isoDate': '2022-11-21'},
                                                'Projects': ['project-1'],
                                                'Sections': [],
                                                'Resource Type': 'task',
                                                'Approval Status': null,
                                                'Completed At': null,
                                                'Created At': {'isoDate': undefined},
                                                'Liked': false,
                                                'Likes': [],
                                                'Modified At': {'isoDate': '2022-10-27T19:23:17.593Z'},
                                                'Number of Likes': 0,
                                                'Resource Subtype': 'default_task',
                                                'Assignee Section': null,
                                                'Custom Fields': ['Cost'],
                                                'Followers': [],
                                                'Parent': null,
                                                'Tags': [],
                                                'Workspace': 'workspace-id-1',
                                                'Cost': '13',
                                            },
                                        },
                                        itemsDeleted: [],
                                    },
                                },
                            ],
                        },
                        {
                            syncId: 'someSyncSourceId2',
                            collections: [
                                {
                                    collectionId: 'Tasks',
                                    itemsPatch: {
                                        items: {
                                            '"4444"': {
                                                'Id': 'fake-new-task-id-2',
                                                'Name': 'name',
                                                'Notes': 'notes',
                                                'Assignee': null,
                                                'Completed': true,
                                                'Permalink': 'link1',
                                                'Start Date': {'isoDate': '2022-11-15'},
                                                'Due Date': {'isoDate': '2022-11-21'},
                                                'Projects': ['project-1'],
                                                'Sections': [],
                                                'Resource Type': 'task',
                                                'Approval Status': null,
                                                'Completed At': null,
                                                'Created At': {'isoDate': undefined},
                                                'Liked': false,
                                                'Likes': [],
                                                'Modified At': {'isoDate': '2022-10-27T19:23:17.593Z'},
                                                'Number of Likes': 0,
                                                'Resource Subtype': 'default_task',
                                                'Assignee Section': null,
                                                'Custom Fields': ['Cost'],
                                                'Followers': [],
                                                'Parent': null,
                                                'Tags': [],
                                                'Workspace': 'workspace-id-1',
                                                'Cost': '13',
                                            },
                                        },
                                        itemsDeleted: [],
                                    },
                                },
                            ],
                        },
                        {
                            syncId: 'someSyncSourceId3',
                            collections: [
                                {
                                    collectionId: 'Tasks',
                                    itemsPatch: {
                                        items: {
                                            '"7777"': {
                                                'Id': 'fake-new-task-id-3',
                                                'Name': 'name',
                                                'Notes': 'notes',
                                                'Assignee': null,
                                                'Completed': true,
                                                'Permalink': 'link1',
                                                'Start Date': {'isoDate': '2022-11-15'},
                                                'Due Date': {'isoDate': '2022-11-21'},
                                                'Projects': ['project-1'],
                                                'Sections': [],
                                                'Resource Type': 'task',
                                                'Approval Status': null,
                                                'Completed At': null,
                                                'Created At': Object({'isoDate': undefined}),
                                                'Liked': false,
                                                'Likes': [],
                                                'Modified At': Object({'isoDate': '2022-10-27T19:23:17.593Z'}),
                                                'Number of Likes': 0,
                                                'Resource Subtype': 'default_task',
                                                'Assignee Section': null,
                                                'Custom Fields': ['Cost'],
                                                'Followers': [],
                                                'Parent': null,
                                                'Tags': [],
                                                'Workspace': 'workspace-id-1',
                                                'Cost': '13',
                                            },
                                        },
                                        itemsDeleted: [],
                                    },
                                },
                            ],
                        },
                    ],
                    errors: {},
                },
            },
        });
    });

    it('partially applies a partially bad patch', async () => {
        await new ActionTester().expectAction({
            action: {
                name: 'Patch',
                data: [
                    {
                        'userCredential': 'totally valid user credential',
                        'packageVersion': '1.1.1',
                        'patches': [
                            {
                                'patch': {
                                    'itemsAdded': {
                                        '"1111"': {'Workspace': 'workspace-id-1'},
                                    },
                                    'itemsChanged': {
                                        '"2222"': {
                                            'Assignee': 'Fudge@example.com',
                                        },
                                        '"task y"': {
                                            'not a field': 'value',
                                        },
                                    },
                                    'itemsDeleted': ['"3333"', '"task z"'], // task z doesn't exist
                                    'syncSourceId': 'someSyncSourceId1',
                                    'syncCollectionId': 'Tasks',
                                    'adapterType': 'EXTENSION_API',
                                    'syncSchema': 'something',
                                },
                                'id': 'patch 1',
                            },
                        ],
                    },
                ],
            },
            asanaCalls: [
                {
                    name: 'tasks.create',
                    arguments: [
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                            workspace: 'workspace-id-1',
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        '2222',
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: 'Fudge@example.com',
                            notes: undefined,
                            name: undefined,
                        },
                    ],
                },
                {
                    name: 'tasks.update',
                    arguments: [
                        'task y',
                        {
                            projects: undefined,
                            completed: undefined,
                            assignee: undefined,
                            notes: undefined,
                            name: undefined,
                        },
                    ],
                },
            ],
            expectedActionResult: {
                status: 200,
                body: {
                    changes: [
                        {
                            syncId: 'someSyncSourceId1',
                            collections: [
                                {
                                    collectionId: 'Tasks',
                                    itemsPatch: {
                                        items: {
                                            '"1111"': {
                                                'Id': 'fake-new-task-id-1',
                                                'Name': 'name',
                                                'Notes': 'notes',
                                                'Assignee': null,
                                                'Completed': true,
                                                'Permalink': 'link1',
                                                'Start Date': {'isoDate': '2022-11-15'},
                                                'Due Date': {'isoDate': '2022-11-21'},
                                                'Projects': ['project-1'],
                                                'Sections': [],
                                                'Resource Type': 'task',
                                                'Approval Status': null,
                                                'Completed At': null,
                                                'Created At': {'isoDate': undefined},
                                                'Liked': false,
                                                'Likes': [],
                                                'Modified At': {'isoDate': '2022-10-27T19:23:17.593Z'},
                                                'Number of Likes': 0,
                                                'Resource Subtype': 'default_task',
                                                'Assignee Section': null,
                                                'Custom Fields': ['Cost'],
                                                'Followers': [],
                                                'Parent': null,
                                                'Tags': [],
                                                'Workspace': 'workspace-id-1',
                                                'Cost': '13',
                                            },
                                        },
                                        itemsDeleted: [],
                                    },
                                },
                            ],
                        },
                    ],
                    errors: {},
                },
            },
        });
    });
});
