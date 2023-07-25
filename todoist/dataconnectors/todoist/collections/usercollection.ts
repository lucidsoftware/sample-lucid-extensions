import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldNames} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';

/**
 * Reference https://developer.todoist.com/rest/v2/#get-all-collaborators
 */
export const userSchema = declareSchema({
    primaryKey: [CollectionEnumFieldNames.Id],
    fields: {
        [CollectionEnumFieldNames.Id]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Name]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Description]: {type: ScalarFieldTypeEnum.STRING},
    },
});

export type UserItemType = ItemType<typeof userSchema.example>;
