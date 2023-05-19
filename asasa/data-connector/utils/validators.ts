import {arrayValidator, isString, objectValidator} from 'lucid-extension-sdk';

export const importBodyValidator = objectValidator({
    workspaceId: isString,
    taskIds: arrayValidator(isString),
});
