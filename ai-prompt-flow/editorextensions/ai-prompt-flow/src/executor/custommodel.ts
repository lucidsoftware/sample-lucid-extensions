import {EditorClient, flatten, JsonSerializable} from 'lucid-extension-sdk';
import {
    AiEndpointConfiguration,
    AzureEndpointConfiguration,
    OpenAiEndpointConfiguration,
} from '../aiendpointconfiguration/aiendpointconfiguration';
import {
    isAzureEndpointConfiguration,
    isOpenAiEndpointConfiguration,
} from '../aiendpointconfiguration/aiendpointconfigurationvalidators';
import {EndpointsProxy} from '../endpointsproxy';
import {AIExample} from './aiexample';
import {AiMessage} from './aimessage';
import {AIModel} from './aimodel';
import {AIFailureResponse, AIResponse} from './airesponse';

export abstract class CustomModel<T extends AiEndpointConfiguration> extends AIModel {
    constructor(
        private readonly client: EditorClient,
        protected readonly configuration: T,
    ) {
        super(configuration['display-name']);
    }
    public async execute(systemPrompt: string, userPrompt: string, examples: AIExample[]): Promise<AIResponse> {
        try {
            const messages = this.getMessages(systemPrompt, userPrompt, examples);
            const result = await this.client.xhr({
                method: 'POST',
                url: this.configuration['endpoint-url'],
                headers: Object.assign(
                    {
                        'Content-Type': 'application/json',
                    },
                    this.getHeaders(),
                ),
                data: JSON.stringify(this.getData(messages)),
            });

            if (result.responseFormat == 'utf8') {
                const json = JSON.parse(result.responseText) as any;
                return new AIResponse(json['choices'][0]['message']['content'], this.configuration['display-name'], 0);
            }
        } catch (error) {
            console.error(error);
        }

        return new AIFailureResponse('Failed to get response from custom endpoint', this.name, 0);
    }

    protected getMessages(systemPrompt: string, userPrompt: string, examples: AIExample[]): AiMessage[] {
        return [
            {'role': 'system', 'content': systemPrompt},
            ...flatten(
                examples.map((example) => [
                    {'role': 'user', 'content': example.user},
                    {'role': 'assistant', 'content': example.assistant},
                ]),
            ),
            {'role': 'user', 'content': userPrompt},
        ];
    }

    protected abstract getData(messages: AiMessage[]): JsonSerializable;
    protected abstract getHeaders(): {[key: string]: string};
}

export class AzureCustomModel extends CustomModel<AzureEndpointConfiguration> {
    constructor(client: EditorClient, configuration: AzureEndpointConfiguration) {
        super(client, configuration);
    }
    protected override getData(messages: AiMessage[]) {
        return {
            'messages': messages,
        };
    }

    protected override getHeaders() {
        return {'api-key': this.configuration['api-key']};
    }
}

export class OpenAiCustomModel extends CustomModel<OpenAiEndpointConfiguration> {
    constructor(client: EditorClient, configuration: OpenAiEndpointConfiguration) {
        super(client, configuration);
    }
    protected override getData(messages: AiMessage[]) {
        return {
            'model': this.configuration['model'],
            'messages': messages,
        };
    }

    protected override getHeaders() {
        return {'Authorization': `Bearer ${this.configuration['api-key']}`};
    }
}

export class CustomModelFactory {
    constructor(
        private readonly client: EditorClient,
        private readonly endpointsProxy: EndpointsProxy,
    ) {}

    public async createModel(modelName: string): Promise<AIModel> {
        const configurations = await this.endpointsProxy.refreshAndGetAllEndpoints();
        const configuration = configurations.find((endpoint) => endpoint['display-name'] == modelName);
        if (isAzureEndpointConfiguration(configuration)) {
            return new AzureCustomModel(this.client, configuration);
        } else if (isOpenAiEndpointConfiguration(configuration)) {
            return new OpenAiCustomModel(this.client, configuration);
        } else {
            throw new Error('Failed to create model from unknown endpoint configuration');
        }
    }
}
