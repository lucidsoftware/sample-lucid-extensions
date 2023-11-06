// Keep lucid-extension-sdk imports out of this file. The angular panels depend on this file and
// something about the transitive dependency on the local version of the lucid-extension-sdk breaks
// the angular projects.

export enum AiBlockType {
    SystemPrompt = 'SystemPrompt',
    UserPrompt = 'UserPrompt',
    Output = 'Response',
    PromptSegment = 'PromptSegment',
    VariablesTable = 'VariablesTable',
    Examples = 'Examples',
}

export type AiBlock = {
    aiBlockType: AiBlockType;
    toJSON: () => SerializedAiBlock;
};

type BaseSerializedAiBlock = {
    'id': string;
    'block-type': AiBlockType;
};

export type SerializedSystemPrompt = BaseSerializedAiBlock & {
    'block-type': AiBlockType.SystemPrompt;
    'model': string;
    'system-prompt': string;
    'count-of-user-prompts': number;
};
export function isSystemPrompt(block: SerializedAiBlock): block is SerializedSystemPrompt {
    return block['block-type'] == AiBlockType.SystemPrompt;
}

export type SerializedUserPrompt = BaseSerializedAiBlock & {
    'user-prompt': string;
    'system-prompt': string | undefined;
    'model-used': string | undefined;
};
export function isUserPrompt(block: SerializedAiBlock): block is SerializedUserPrompt {
    return block['block-type'] == AiBlockType.UserPrompt;
}

export type SerializedOutputBlock = BaseSerializedAiBlock & {
    'model-used': string | undefined;
    'timestamp': number | undefined;
    'system-prompt': string | undefined;
    'user-prompt': string | undefined;
    'output': string;
};
export function isOutput(block: SerializedAiBlock): block is SerializedOutputBlock {
    return block['block-type'] == AiBlockType.Output;
}

export type SerializedPromptSegment = BaseSerializedAiBlock & {
    'segment-name': string;
    'segment-value': string;
};
export function isPromptSegment(block: SerializedAiBlock): block is SerializedPromptSegment {
    return block['block-type'] == AiBlockType.PromptSegment;
}

export type SerializedVariablesTable = BaseSerializedAiBlock & {
    'variables': [string, string][];
};
export function isVariablesTable(block: SerializedAiBlock): block is SerializedVariablesTable {
    return block['block-type'] == AiBlockType.VariablesTable;
}

export type SerializedExamplesBlock = BaseSerializedAiBlock & {
    'system-prompt': string | undefined;
    'examples': [string, string][];
};
export function isExamples(block: SerializedAiBlock): block is SerializedExamplesBlock {
    return block['block-type'] == AiBlockType.Examples;
}

export type SerializedAiBlock =
    | SerializedSystemPrompt
    | SerializedUserPrompt
    | SerializedOutputBlock
    | SerializedPromptSegment
    | SerializedVariablesTable
    | SerializedExamplesBlock;
