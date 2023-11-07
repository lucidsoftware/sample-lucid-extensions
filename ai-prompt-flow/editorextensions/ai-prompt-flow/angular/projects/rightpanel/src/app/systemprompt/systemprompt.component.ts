import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SerializedSystemPrompt} from '@extension/blocks/serializedblocks';
import {ButtonComponent, CalloutComponent} from '@shared';

@Component({
    selector: 'app-system-prompt',
    templateUrl: './systemprompt.component.html',
    standalone: true,
    styleUrls: ['./systemprompt.component.less'],
    imports: [CommonModule, ButtonComponent, CalloutComponent],
})
export class SystemPromptComponent {
    @Input({required: true}) public systemPrompt!: SerializedSystemPrompt;
    @Input({required: true}) public availableModels!: string[];
    @Input({required: true}) public executing: boolean = false;
    @Input({required: true}) public isExecuteFailed: boolean = false;
    @Output() executingChange = new EventEmitter<boolean>();
    @Output() isExecuteFailedChange = new EventEmitter<boolean>();

    protected get invalidModelName(): string {
        return this.systemPrompt['model'] || this.phrases.emptyModel;
    }

    protected get isModelInvalid(): boolean {
        return !this.systemPrompt['model'] || !this.availableModels.includes(this.systemPrompt['model']);
    }

    protected icons = {
        warning: 'AlertTriangle24.svg',
        error: 'ErrorTriangle24.svg',
    };

    protected phrases = {
        // TODO i18n
        systemPrompt: 'System Prompt',
        model: 'Model',
        emptyModel: 'None',
        setupCalloutTitle: 'Setup',
        setupCalloutText: 'Connect your model in the settings tab of the left panel to execute this prompt.',
        modelInvalid: 'Model Invalid',
        userPromptsConnected: (count: number) => {
            switch (count) {
                case 0:
                    return 'No user prompts connected';
                case 1:
                    return '1 user prompt connected';
                default:
                    return `${count} user prompts connected`;
            }
        },
        executePrompts: (count: number) => {
            if (count == 1) {
                return 'Execute prompt';
            }
            return 'Execute prompts';
        },
        executeFailed: "Sorry, we couldn't execute your prompt. Please try again.",
    };

    protected executePrompts() {
        this.executing = true;
        this.executingChange.emit(this.executing);
        this.isExecuteFailed = false;
        this.isExecuteFailedChange.emit(this.isExecuteFailed);
        parent.postMessage({'type': 'executePrompts', 'ids': [this.systemPrompt['id']]}, '*');
    }

    protected updateSystemPrompt(e: Event) {
        const text = (e.target as HTMLElement).innerText;

        parent.postMessage({'type': 'updateBlockText', 'id': this.systemPrompt['id'], 'newText': text}, '*');
    }

    protected changeModel(e: Event) {
        const model = (e.target as HTMLSelectElement).value;

        model && parent.postMessage({'type': 'updateModel', 'id': this.systemPrompt['id'], 'model': model}, '*');
    }

    protected isExecuteDisabled() {
        return this.systemPrompt['count-of-user-prompts'] == 0 || this.isModelInvalid;
    }
}
