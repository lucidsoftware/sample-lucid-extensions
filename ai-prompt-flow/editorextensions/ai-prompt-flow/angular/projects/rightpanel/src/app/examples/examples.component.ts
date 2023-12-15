import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {SerializedExamplesBlock} from '@extension/blocks/serializedblocks';
import {AddTableRow, DeleteTableRow, UpdateTableCellText} from '@extension/rightpanel/rightpanelmessage';
import {ButtonComponent} from '@shared';

@Component({
    selector: 'app-examples',
    templateUrl: './examples.component.html',
    standalone: true,
    styleUrls: ['./examples.component.less'],
    imports: [CommonModule, ButtonComponent],
})
export class ExamplesComponent {
    @Input({required: true}) examples!: SerializedExamplesBlock;

    protected phrases = {
        // TODO i18n
        systemPrompt: 'System Prompt',
        noSystemPromptConnected: 'No system prompt connected',
        fewShotLearningExamples: 'Few shot learning examples',
        user: 'User',
        assistant: 'Response',
        noExamples: 'No few shot learning examples provided',
        addExample: 'Add example',
    };

    protected updateExample(text: string, row: number, column: number) {
        const message: UpdateTableCellText = {
            'type': 'updateTableCellText',
            'id': this.examples['id'],
            'newText': text,
            'editableRow': row,
            'column': column,
        };
        parent.postMessage(message, '*');
    }

    protected updateExampleUser(e: Event, row: number) {
        const text = (e.target as HTMLElement).innerText.trim();
        this.updateExample(text, row, 0);
    }

    protected updateExampleResponse(e: Event, row: number) {
        const text = (e.target as HTMLElement).innerText.trim();
        this.updateExample(text, row, 1);
    }

    protected addExample() {
        const message: AddTableRow = {
            'type': 'addTableRow',
            'id': this.examples['id'],
        };
        parent.postMessage(message, '*');
        this.examples.examples.push(['', '']);
    }

    protected deleteExample(row: number) {
        const message: DeleteTableRow = {
            'type': 'deleteTableRow',
            'id': this.examples['id'],
            'editableRow': row,
        };
        parent.postMessage(message, '*');
        this.examples.examples.splice(row, 1);
    }
}
