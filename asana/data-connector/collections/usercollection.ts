import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldNames} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

export const userSchema = declareSchema({
    primaryKey: [CollectionEnumFieldNames.Id],
    fields: {
        [CollectionEnumFieldNames.Id]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Name]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Description]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
        [CollectionEnumFieldNames.Color]: {type: ScalarFieldTypeEnum.NULL},
        [CollectionEnumFieldNames.IconUrl]: {type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL] as const},
    },
});

export type UserItemType = ItemType<typeof userSchema.example>;
