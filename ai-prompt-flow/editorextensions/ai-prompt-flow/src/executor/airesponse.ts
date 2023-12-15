export class AIResponse {
    constructor(
        public readonly text: string,
        public readonly model: string,
        public readonly responseTime: number,
    ) {}
}

export class AIFailureResponse extends AIResponse {}
