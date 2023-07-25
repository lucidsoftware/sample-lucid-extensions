import {declareSchema, ItemType} from 'lucid-extension-sdk/core/data/fieldspecification';
import {CollectionEnumFieldNames} from 'lucid-extension-sdk/core/data/fieldtypedefinition/collectionenumfieldtype';
import {ScalarFieldTypeEnum} from 'lucid-extension-sdk/core/data/fieldtypedefinition/scalarfieldtype';
/**
 * Reference https://developer.todoist.com/rest/v2/#sections
 */
export const sectionSchema = declareSchema({
    primaryKey: [CollectionEnumFieldNames.Id],
    fields: {
        [CollectionEnumFieldNames.Id]: {type: ScalarFieldTypeEnum.STRING},
        [CollectionEnumFieldNames.Name]: {type: ScalarFieldTypeEnum.STRING},
        'Order': {type: ScalarFieldTypeEnum.NUMBER},
    },
});

export type SectionItemType = ItemType<typeof sectionSchema.example>;
