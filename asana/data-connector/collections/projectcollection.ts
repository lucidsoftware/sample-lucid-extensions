import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldNames} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

export const projectSchema = declareSchema({
    primaryKey: [CollectionEnumFieldNames.Id],
    fields: {
        [CollectionEnumFieldNames.Id]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Name]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Description]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        [CollectionEnumFieldNames.Color]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        [CollectionEnumFieldNames.IconUrl]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        'Workspace': {type: ScalarFieldTypeEnum.STRING},
    },
});

export type ProjectItemType = ItemType<typeof projectSchema.example>;
