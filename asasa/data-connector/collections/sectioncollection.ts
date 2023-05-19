import {
    CollectionEnumFieldNames,
    CollectionEnumFieldType,
    declareSchema,
    ItemType,
    ScalarFieldTypeEnum,
} from 'lucid-extension-sdk';

export const sectionSchema = declareSchema({
    primaryKey: [CollectionEnumFieldNames.Id],
    fields: {
        [CollectionEnumFieldNames.Id]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Name]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Description]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        [CollectionEnumFieldNames.Color]: {type: ScalarFieldTypeEnum.NULL},
        [CollectionEnumFieldNames.IconUrl]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        'Project': {type: new CollectionEnumFieldType('Projects')},
    },
});

export type SectionItemType = ItemType<typeof sectionSchema.example>;
