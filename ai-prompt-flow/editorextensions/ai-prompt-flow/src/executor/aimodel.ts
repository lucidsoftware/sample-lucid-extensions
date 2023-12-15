import {AIExample} from './aiexample';
import {AIResponse} from './airesponse';

export abstract class AIModel {
    public abstract execute(systemPrompt: string, userPrompt: string, examples: AIExample[]): Promise<AIResponse>;

    constructor(public readonly name: string) {}
}
