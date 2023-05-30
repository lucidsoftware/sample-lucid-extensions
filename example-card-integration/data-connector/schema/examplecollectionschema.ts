import {declareSchema, ItemType, ScalarFieldTypeEnum} from 'lucid-extension-sdk';
import {TaskFieldNames} from '../../common/names';

export const exampleCollectionSchema = declareSchema({
    primaryKey: [TaskFieldNames.ID],
    fields: {
        [TaskFieldNames.ID]: {type: ScalarFieldTypeEnum.STRING},
        [TaskFieldNames.NAME]: {type: ScalarFieldTypeEnum.STRING},
        [TaskFieldNames.COMPLETE]: {type: ScalarFieldTypeEnum.BOOLEAN},
        [TaskFieldNames.DUE]: {type: ScalarFieldTypeEnum.DATEONLY},
        [TaskFieldNames.COST]: {type: ScalarFieldTypeEnum.NUMBER},
    },
});

export type ExampleTaskType = ItemType<typeof exampleCollectionSchema.example>;
