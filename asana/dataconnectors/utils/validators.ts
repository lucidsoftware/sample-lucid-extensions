import {isString} from 'lucid-extension-sdk/core/checks';
import {arrayValidator, objectValidator} from 'lucid-extension-sdk/core/validators/validators';

export const importBodyValidator = objectValidator({
    workspaceId: isString,
    taskIds: arrayValidator(isString),
});
