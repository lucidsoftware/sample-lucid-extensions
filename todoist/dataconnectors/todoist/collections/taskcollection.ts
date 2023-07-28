import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldType} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {FieldTypeArray} from 'lucid-extension-sdk/core/data/fieldtypedefinition/fieldtypearray';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';
import {SemanticKind} from 'lucid-extension-sdk/core/data/fieldtypedefinition/semantickind';
import {FieldConstraintType} from 'lucid-extension-sdk/core/data/serializedfield/serializedfielddefinition';
import {DefaultFieldNames} from '../../../common/fields';

/**
 * Reference https://developer.todoist.com/rest/v2/#tasks
 */
export const taskSchema = declareSchema({
    primaryKey: [DefaultFieldNames.Id],
    fields: {
        [DefaultFieldNames.Id]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.Id],
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Project]: {
            type: ScalarFieldTypeEnum.STRING,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Section]: {
            type: [new CollectionEnumFieldType('Sections'), ScalarFieldTypeEnum.NULL] as const,
            mapping: [SemanticKind.Id],
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Content]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.Name],
        },
        [DefaultFieldNames.Description]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.Description],
        },
        [DefaultFieldNames.Completed]: {
            type: ScalarFieldTypeEnum.BOOLEAN,
            mapping: [SemanticKind.Status],
        },
        [DefaultFieldNames.Labels]: {
            type: new FieldTypeArray<ScalarFieldTypeEnum.STRING>([ScalarFieldTypeEnum.STRING]),
            constraints: [{type: FieldConstraintType.LOCKED}], // TODO: This might not be necessary, check behavior
        },
        [DefaultFieldNames.Parent]: {
            type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Order]: {
            type: ScalarFieldTypeEnum.NUMBER,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Priority]: {
            type: ScalarFieldTypeEnum.NUMBER,
            constraints: [
                {type: FieldConstraintType.MIN_VALUE, value: 1},
                {type: FieldConstraintType.MAX_VALUE, value: 4},
            ],
        },
        [DefaultFieldNames.Due]: {
            type: [ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.NULL] as const,
            mapping: [SemanticKind.EndTime],
        },
        [DefaultFieldNames.Link]: {
            type: ScalarFieldTypeEnum.STRING,
            mapping: [SemanticKind.URL],
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.NumberOfComments]: {
            type: ScalarFieldTypeEnum.NUMBER,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.CreatedAt]: {
            type: [ScalarFieldTypeEnum.DATEONLY, ScalarFieldTypeEnum.DATE] as const,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Creator]: {
            type: [new CollectionEnumFieldType('Users'), ScalarFieldTypeEnum.NULL] as const,
            constraints: [{type: FieldConstraintType.LOCKED}],
        },
        [DefaultFieldNames.Assignee]: {
            type: [new CollectionEnumFieldType('Users'), ScalarFieldTypeEnum.NULL] as const,
            mapping: [SemanticKind.Assignee],
            constraints: [{type: FieldConstraintType.MAX_VALUE, value: 1}],
        },
        [DefaultFieldNames.Assinger]: {
            type: [new CollectionEnumFieldType('Users'), ScalarFieldTypeEnum.NULL] as const,
            constraints: [{type: FieldConstraintType.MAX_VALUE, value: 1}],
        },
    },
});

export type TaskFieldsStructure = typeof taskSchema.example;
export type TaskItemType = ItemType<TaskFieldsStructure>;
