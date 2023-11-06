// Keep lucid-extension-sdk imports out of this file. The angular panels depend on this file and
// something about the transitive dependency on the local version of the lucid-extension-sdk breaks
// the angular projects.

export type AiEndpointServiceType = 'Azure' | 'OpenAI';
export function isAiEndpointServiceType(s: string): s is AiEndpointServiceType {
    return s == 'Azure' || s == 'OpenAI';
}
interface BaseAiEndpointConfiguration {
    'display-name': string;
    'endpoint-url': string;
    'api-key': string;
    'service-type': AiEndpointServiceType;
}

export interface AzureEndpointConfiguration extends BaseAiEndpointConfiguration {
    'service-type': 'Azure';
}

export interface OpenAiEndpointConfiguration extends BaseAiEndpointConfiguration {
    'service-type': 'OpenAI';
    'model': string;
}

export type AiEndpointConfiguration = AzureEndpointConfiguration | OpenAiEndpointConfiguration;
export type ReadonlyAiEndpointConfiguration = Readonly<AiEndpointConfiguration>;

export function endpointConfigurationsAreEqual(a: AiEndpointConfiguration, b: AiEndpointConfiguration) {
    if (
        a['display-name'] != b['display-name'] ||
        a['endpoint-url'] != b['endpoint-url'] ||
        a['api-key'] != b['api-key'] ||
        a['service-type'] != b['service-type']
    ) {
        return false;
    }
    if (a['service-type'] == 'OpenAI' && b['service-type'] == 'OpenAI' && a['model'] != b['model']) {
        return false;
    }
    return true;
}
