import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldType} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {FieldTypeArray} from 'lucid-extension-sdk/core/data/fieldtypedefinition/fieldtypearray';
import {FieldTypeDefinition} from 'lucid-extension-sdk/core/data/fieldtypedefinition/fieldtypedefinition';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';
import {SemanticKind} from 'lucid-extension-sdk/core/data/fieldtypedefinition/semantickind';
import {FieldConstraintType} from 'lucid-extension-sdk/core/data/serializedfield/serializedfielddefinition';
import {DefaultFieldNames} from '../../common/fields';

const nullable = <T extends FieldTypeDefinition>(type: T) => {
    return [type, ScalarFieldTypeEnum.NULL] as const;
};

export const taskSchema = declareSchema({
    primaryKey: [DefaultFieldNames.Id],
    fields: {
        [DefaultFieldNames.Id]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.Id],
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.ResourceType]: {
            type: ScalarFieldTypeEnum.STRING,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.ApprovalStatus]: {
            type: nullable(ScalarFieldTypeEnum.STRING),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Completed]: {
            type: ScalarFieldTypeEnum.BOOLEAN,
            mapping: [SemanticKind.Status],
        },
        [DefaultFieldNames.CompletedAt]: {
            type: nullable(ScalarFieldTypeEnum.DATE),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.CreatedAt]: {
            type: ScalarFieldTypeEnum.DATE,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.DueDate]: {
            type: [ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL] as const,
            mapping: [SemanticKind.EndTime],
        },
        [DefaultFieldNames.Liked]: {
            type: ScalarFieldTypeEnum.BOOLEAN,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Likes]: {
            type: new FieldTypeArray([new CollectionEnumFieldType('Users')]),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Sections]: {
            type: nullable(new FieldTypeArray([new CollectionEnumFieldType('Sections')])),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.ModifiedAt]: {
            type: ScalarFieldTypeEnum.DATE,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Name]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.Name, SemanticKind.Title],
        },
        [DefaultFieldNames.Notes]: {
            type: nullable(ScalarFieldTypeEnum.STRING),
            mapping: [SemanticKind.Description],
        },
        [DefaultFieldNames.NumberOfLikes]: {
            type: ScalarFieldTypeEnum.NUMBER,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.ResourceSubtype]: {
            type: nullable(ScalarFieldTypeEnum.STRING),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.StartDate]: {
            type: [ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL] as const,
            mapping: [SemanticKind.StartTime],
        },
        [DefaultFieldNames.Assignee]: {
            type: nullable(new CollectionEnumFieldType('Users')),
            mapping: [SemanticKind.Assignee],
            constraints: [{type: FieldConstraintType.MAX_VALUE, value: 1}],
        },
        [DefaultFieldNames.AssingeeSection]: {
            type: nullable(ScalarFieldTypeEnum.STRING),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.CustomFields]: {
            type: new FieldTypeArray([ScalarFieldTypeEnum.STRING as const]),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Followers]: {
            type: new FieldTypeArray([new CollectionEnumFieldType('Users')]),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Parent]: {
            type: nullable(ScalarFieldTypeEnum.STRING),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Permalink]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.URL],
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Projects]: {
            type: new FieldTypeArray([new CollectionEnumFieldType('Projects')]),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Tags]: {
            type: new FieldTypeArray([ScalarFieldTypeEnum.STRING as const]),
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Workspace]: {
            type: ScalarFieldTypeEnum.STRING,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
    },
});

export type TaskItemType = ItemType<typeof taskSchema.example>;
