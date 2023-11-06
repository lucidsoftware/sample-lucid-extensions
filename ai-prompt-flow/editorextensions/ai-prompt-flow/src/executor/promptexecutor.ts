import {EditorClient, flatten} from 'lucid-extension-sdk';
import {ResponseBlock, SystemPromptBlock, UserPromptBlock, VariablesTableBlock} from '../blocks/blocks';
import {AIFailureResponse} from './airesponse';
import {CustomModelFactory} from './custommodel';

interface ExecutionData {
    system: SystemPromptBlock;
    user: UserPromptBlock;
    variables?: VariablesTableBlock;
}

export class PromptExecutor {
    private readonly responseDef = this.client.getCustomShapeDefinition(ResponseBlock.library, ResponseBlock.shape);

    constructor(
        private readonly client: EditorClient,
        private readonly customModelFactory: CustomModelFactory,
    ) {}

    private enumerateExecutions(prompt: UserPromptBlock | SystemPromptBlock | VariablesTableBlock): ExecutionData[] {
        const executions: ExecutionData[] = [];

        if (prompt instanceof VariablesTableBlock) {
            const user = prompt.getUserPrompt();
            if (user) {
                const system = user.getSystemPrompt();
                if (system) {
                    executions.push({system, user, variables: prompt});
                }
            }
        } else if (prompt instanceof UserPromptBlock) {
            const system = prompt.getSystemPrompt();
            if (system) {
                const variables = prompt.getVariableTables();
                if (variables.length == 0) {
                    executions.push({system, user: prompt});
                } else {
                    executions.push(...variables.map((variables) => ({system, user: prompt, variables})));
                }
            }
        } else if (prompt instanceof SystemPromptBlock) {
            return flatten(prompt.getUserPrompts().map((user) => this.enumerateExecutions(user)));
        }

        return executions;
    }

    public async execute(
        prompt: UserPromptBlock | SystemPromptBlock | VariablesTableBlock,
        onAIFailureResponse: () => void = () => {},
        /** All the system blocks that have already executed in this session, used to prevent infinite loops. */
        upstreamExecutions: Set<string> = new Set(),
    ) {
        return await Promise.all(
            this.enumerateExecutions(prompt).map(({system, user, variables}) =>
                this.executeSingle(system, user, upstreamExecutions, onAIFailureResponse, variables),
            ),
        );
    }

    private parseTime(responseTime: number) {
        return responseTime / 1000 + 'S';
    }

    private async executeSingle(
        system: SystemPromptBlock,
        user: UserPromptBlock,
        upstreamExecutions: Set<string>,
        onAIFailureResponse: () => void,
        variables?: VariablesTableBlock,
    ) {
        if (upstreamExecutions.has(system.id)) {
            throw new Error(`Infinite loop detected with System Block: ${system.id}`);
        } else if (upstreamExecutions.size > 10) {
            // This measures depth, not breadth. This won't interfere with creating multiple
            // branches, only with many models in a single chain. I can't think of a good reason to
            // have more than 10 models in a single chain, but it is a pretty arbitrary limit so I
            // don't have issues with bumping it up if there are valid uses.
            throw new Error(
                'Too many system blocks executed in a single session. Reach out to ML/AI 3 if you have a valid use case for this.',
            );
        } else {
            upstreamExecutions = new Set(upstreamExecutions).add(system.id);
        }
        const modelName = system.getModelName();
        const model = await this.customModelFactory.createModel(modelName);
        if (!model) {
            throw new Error('Model not found: ' + modelName);
        }

        //If a response block exists, replace its text. Otherwise, create one.
        const tail = variables ?? user;
        let response = tail.getResponseBlock();
        if (!response) {
            const def = await this.responseDef;
            if (!def) {
                throw new Error('Response block class not found');
            }

            const tailBB = tail.getBoundingBox();
            response = tail.getPage().addBlock({
                ...def,
                boundingBox: {
                    ...tailBB,
                    y: tailBB.y + tailBB.h + 80,
                },
            }) as ResponseBlock;

            response.setShadow({angle: 270, blur: 16, color: '#00000033', distance: 3});
            tail.getPage().addLine({
                endpoint1: {
                    connection: tail,
                    linkX: 0.5,
                    linkY: 1,
                },
                endpoint2: {
                    connection: response,
                    linkX: 0.5,
                    linkY: 0,
                },
            });
        }
        const nonNullResponse = response;

        response.setResponseModel(model.name);

        //Clear any previous response, including generated shapes
        response.setResponseText('Executing...');
        response
            .getPage()
            .allItems.filter((item) => item.shapeData.get('AIResponse') == nonNullResponse.id)
            .forEach((item) => item.delete());

        const result = await model.execute(system.getPromptText(), user.getPromptText(variables), system.getExamples());
        response.setResponseText(result.text);
        if (result instanceof AIFailureResponse) {
            onAIFailureResponse();
        }

        //update block size to make contents fit inside it.
        response.autoResize();
        response.shapeData.set('ResponseTime', this.parseTime(result.responseTime)); // duration to get response
        response.shapeData.set('SystemPrompt', system.getPromptText());
        response.shapeData.set('UserPrompt', user.getPromptText(variables));
        response.shapeData.set('Examples', JSON.stringify(system.getExamples()));
        response.shapeData.set('CreatedAt', Date.now());

        const downstreamSystemBlocks = response.getDownstreamSystemBlocks();
        await Promise.all(
            downstreamSystemBlocks.map((block) => this.execute(block, onAIFailureResponse, upstreamExecutions)),
        );
    }
}
