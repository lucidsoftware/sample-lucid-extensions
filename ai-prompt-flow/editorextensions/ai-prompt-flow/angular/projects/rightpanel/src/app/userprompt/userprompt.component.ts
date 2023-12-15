import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SerializedUserPrompt} from '@extension/blocks/serializedblocks';
import {ButtonComponent} from '@shared';

@Component({
    selector: 'app-user-prompt',
    templateUrl: './userprompt.component.html',
    standalone: true,
    styleUrls: ['./userprompt.component.less'],
    imports: [CommonModule, ButtonComponent],
})
export class UserPromptComponent {
    @Input({required: true}) public userPrompt!: SerializedUserPrompt;
    @Input({required: true}) public availableModels!: string[];
    @Input({required: true}) public executing: boolean = false;
    @Input({required: true}) public isExecuteFailed: boolean = false;
    @Output() executingChange = new EventEmitter<boolean>();
    @Output() isExecuteFailedChange = new EventEmitter<boolean>();

    protected icons = {
        warning: 'AlertTriangle24.svg',
        error: 'ErrorTriangle24.svg',
    };

    protected phrases = {
        // TODO i18n
        systemPrompt: 'System Prompt',
        userPrompt: 'User Prompt',
        modelUsed: 'Model used',
        executePrompt: 'Execute prompt',
        systemPromptInvalid: () => {
            if (this.userPrompt['system-prompt'] == undefined) {
                return 'No system prompt connected';
            } else {
                return 'System prompt model invalid';
            }
        },
        executeFailed: "Sorry, we couldn't execute your prompt. Please try again.",
    };

    protected executePrompt() {
        this.executing = true;
        this.executingChange.emit(this.executing);
        this.isExecuteFailed = false;
        this.isExecuteFailedChange.emit(this.isExecuteFailed);
        parent.postMessage({'type': 'executePrompts', 'ids': [this.userPrompt['id']]}, '*');
    }

    protected updateUserPrompt(e: Event) {
        const text = (e.target as HTMLElement).innerText;

        parent.postMessage({'type': 'updateBlockText', 'id': this.userPrompt['id'], 'newText': text}, '*');
    }

    protected isExecuteDisabled() {
        return (
            this.userPrompt['system-prompt'] == undefined ||
            !this.userPrompt['model-used'] ||
            !this.availableModels.includes(this.userPrompt['model-used'])
        );
    }
}
