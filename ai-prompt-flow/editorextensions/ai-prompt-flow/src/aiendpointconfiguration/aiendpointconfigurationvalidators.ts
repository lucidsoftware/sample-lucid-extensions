import {isString, strictObjectValidator} from 'lucid-extension-sdk';
import {
    AiEndpointConfiguration,
    AzureEndpointConfiguration,
    OpenAiEndpointConfiguration,
} from './aiendpointconfiguration';
export function isAzureEndpointConfiguration(
    possibleEndpoint: unknown,
): possibleEndpoint is AzureEndpointConfiguration {
    return strictObjectValidator({
        'display-name': isString,
        'endpoint-url': isString,
        'api-key': isString,
        'service-type': (x): x is 'Azure' => isString(x) && x == 'Azure',
    })(possibleEndpoint);
}

export function isOpenAiEndpointConfiguration(
    possibleEndpoint: unknown,
): possibleEndpoint is OpenAiEndpointConfiguration {
    return strictObjectValidator({
        'display-name': isString,
        'endpoint-url': isString,
        'api-key': isString,
        'service-type': (x): x is 'OpenAI' => isString(x) && x == 'OpenAI',
        'model': isString,
    })(possibleEndpoint);
}

export function isAiEndpointConfiguration(possibleEndpoint: unknown): possibleEndpoint is AiEndpointConfiguration {
    return isAzureEndpointConfiguration(possibleEndpoint) || isOpenAiEndpointConfiguration(possibleEndpoint);
}
