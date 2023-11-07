import {EditorClient, isArray} from 'lucid-extension-sdk';
import {ReadonlyAiEndpointConfiguration} from './aiendpointconfiguration/aiendpointconfiguration';
import {isAiEndpointConfiguration} from './aiendpointconfiguration/aiendpointconfigurationvalidators';

export class EndpointsProxy {
    private endpoints: ReadonlyAiEndpointConfiguration[] | undefined;
    constructor(private readonly client: EditorClient) {}

    public async setEndpoints(endpoints: ReadonlyAiEndpointConfiguration[]) {
        const settings = new Map();
        settings.set('endpoints', JSON.stringify(endpoints));
        await this.client.setPackageSettings(settings);
        this.endpoints = endpoints;
    }

    public async refreshAndGetAllEndpoints(): Promise<ReadonlyAiEndpointConfiguration[]> {
        this.endpoints = undefined;
        return this.getAllEndpoints();
    }

    /** Returns a cached version of the endpoints, or downloads them if a cached version is not available. */
    public async getAllEndpoints(): Promise<ReadonlyAiEndpointConfiguration[]> {
        if (this.endpoints) {
            return this.endpoints;
        }
        const rawEndpoints = ((await this.client.getPackageSettings()).get('endpoints') as string) ?? '[]';
        let endpoints: ReadonlyAiEndpointConfiguration[] = [];
        try {
            endpoints = JSON.parse(rawEndpoints) as ReadonlyAiEndpointConfiguration[];
        } catch {
            console.error('Package settings could not be parsed as JSON');
        }

        if (!(isArray(endpoints) && endpoints.every((endpoint) => isAiEndpointConfiguration(endpoint)))) {
            console.error('Received invalid endpoints from package settings');
            endpoints = [];
        }
        this.endpoints = endpoints;
        return endpoints;
    }
}
