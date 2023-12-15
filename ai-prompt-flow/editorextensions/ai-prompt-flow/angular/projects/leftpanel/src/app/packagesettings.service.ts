import {Injectable} from '@angular/core';
import {
    AiEndpointConfiguration,
    endpointConfigurationsAreEqual,
    ReadonlyAiEndpointConfiguration,
} from '@extension/aiendpointconfiguration/aiendpointconfiguration';

@Injectable({providedIn: 'root'})
export class PackageSettings {
    private _officialEndpoints: ReadonlyAiEndpointConfiguration[] = [];

    /** The endpoints currently saved in the package settings. */
    public get officialEndpoints(): ReadonlyArray<ReadonlyAiEndpointConfiguration> {
        return this._officialEndpoints;
    }

    /** An editable copy of the endpoints. Changes are not saved to the package settings. */
    public endpoints: EditableEndpoint[] = [];
    private endpointsLoaded = false;
    public canEdit = false;
    private canEditLoaded = false;
    private _loaded: boolean = false;
    public get loaded() {
        const loaded = this.endpointsLoaded && this.canEditLoaded;
        if (loaded && !this._loaded) {
            this.callbacks.map((c) => c());
        }
        this._loaded = loaded;
        return this._loaded;
    }

    private callbacks: (() => void)[] = [];

    constructor() {
        // 'message' events aren't received until after the window loads, so don't send messages
        // that need a reply until then
        window.addEventListener('load', () => {
            this.init();
        });
        window.addEventListener('message', (e) => {
            this.handleEvent(e);
        });
    }

    public init() {
        parent.postMessage({message: 'checkCanEditPackageSettings'}, '*');
        parent.postMessage({message: 'requestEndpoints'}, '*');
    }

    public addNewEndpoint() {
        this.endpoints.push({
            'display-name': '',
            'service-type': 'OpenAI',
            'endpoint-url': '',
            'api-key': '',
            'model': '',
            editing: true,
            originalIndex: -1,
        });
    }

    public isEditing() {
        return !!this.endpoints.find((endpoint) => endpoint.editing);
    }

    public saveEndpoint(endpoint: EditableEndpoint) {
        this.verifyEndpoints();
        endpoint.editing = false;
        const officialEndpoint = this.convertToOfficialEndpoint(endpoint);
        if (endpoint.originalIndex >= 0) {
            this._officialEndpoints.splice(endpoint.originalIndex, 1, officialEndpoint);
        } else {
            endpoint.originalIndex = this._officialEndpoints.length;
            this._officialEndpoints.push(officialEndpoint);
        }
        this.saveEndpoints();
    }

    public deleteEndpoint(endpoint: EditableEndpoint) {
        this.verifyEndpoints();
        if (endpoint.originalIndex >= 0) {
            this._officialEndpoints.splice(endpoint.originalIndex, 1);
        }
        this.endpoints = this.endpoints.filter((e) => e != endpoint);
        this.saveEndpoints();
    }

    public resetEndpoint(endpoint: EditableEndpoint) {
        this.verifyEndpoints();
        if (endpoint.originalIndex >= 0) {
            Object.assign(endpoint, this.officialEndpoints[endpoint.originalIndex]);
        } else {
            this.deleteEndpoint(endpoint);
        }
        endpoint.editing = false;
        this.verifyEndpoints();
    }

    /** Calls the callback once the package settings have been loaded. If already loaded, calls immediately. */
    public runWhenLoaded(callback: () => void) {
        if (!this.loaded) {
            this.callbacks.push(callback);
        } else {
            callback();
        }
    }

    private handleEvent(e: MessageEvent) {
        if (e.data['message'] == 'canEditPackageSettings') {
            this.canEdit = e.data['canEditPackageSettings'];
            this.canEditLoaded = true;
        } else if (e.data['endpoints']) {
            this._officialEndpoints = e.data['endpoints'];
            if (!this.endpointsLoaded) {
                // this.endpoints is the local working copy, so we only set this on first load.
                // this.verifyEndpoints() will ensure the official and local copies are in sync.
                this.endpoints = this._officialEndpoints.map((endpoint, i) =>
                    Object.assign({editing: false, originalIndex: i, 'model': ''}, endpoint),
                );
                this.endpointsLoaded = true;
            }
            this.verifyEndpoints();
        }
    }

    private convertToOfficialEndpoint(editableEndpoint: EditableEndpoint): ReadonlyAiEndpointConfiguration {
        if (editableEndpoint['service-type'] == 'Azure') {
            return {
                'display-name': editableEndpoint['display-name'],
                'endpoint-url': editableEndpoint['endpoint-url'],
                'api-key': editableEndpoint['api-key'],
                'service-type': editableEndpoint['service-type'],
            };
        } else if (editableEndpoint['service-type'] == 'OpenAI') {
            return {
                'display-name': editableEndpoint['display-name'],
                'endpoint-url': editableEndpoint['endpoint-url'],
                'api-key': editableEndpoint['api-key'],
                'model': editableEndpoint['model'],
                'service-type': editableEndpoint['service-type'],
            };
        } else {
            throw new Error(`Unknown service type: ${editableEndpoint['service-type']}`);
        }
    }

    /** Checks that the local copy of the official endpoints are compatible with the editable copies
     * of the endpoints. */
    private verifyEndpoints() {
        let foundCount = 0;
        for (const workingEndpoint of this.endpoints) {
            if (workingEndpoint.originalIndex == -1) {
                continue;
            }
            const officialEndpoint = this.officialEndpoints[workingEndpoint.originalIndex];
            if (!officialEndpoint) {
                throw new Error('No corresponding official endpoint found for local copy of an endpoint.');
            }
            foundCount++;
            // If we are currently editing this endpoint the properties are allowed to differ
            if (workingEndpoint.editing) {
                continue;
            }
            if (!endpointConfigurationsAreEqual(workingEndpoint, officialEndpoint)) {
                throw new Error("Local and official copies of an endpoint don't match.");
            }
        }

        if (this.officialEndpoints.length != foundCount) {
            throw new Error(
                `Found ${this.officialEndpoints.length} official endpoints and ${foundCount} working equivalents.`,
            );
        }
    }

    private saveEndpoints() {
        parent.postMessage({message: 'updateEndpoints', endpoints: this._officialEndpoints}, '*');
    }
}

export type EditableEndpoint = AiEndpointConfiguration & {
    editing: boolean;
    originalIndex: number;
    // So you can switch back and forth between service types while editing without losing the last-entered value.
    'model': string;
};
