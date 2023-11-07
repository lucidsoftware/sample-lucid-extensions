import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {SerializedVariablesTable} from '@extension/blocks/serializedblocks';
import {AddTableRow, DeleteTableRow, UpdateTableCellText} from '@extension/rightpanel/rightpanelmessage';
import {ButtonComponent} from '@shared';

@Component({
    selector: 'app-variables',
    templateUrl: './variables.component.html',
    standalone: true,
    styleUrls: ['./variables.component.less'],
    imports: [CommonModule, ButtonComponent],
})
export class VariablesComponent {
    @Input({required: true}) variables!: SerializedVariablesTable;

    protected phrases = {
        // TODO i18n
        name: 'Name',
        value: 'Value',
        noUserVariables: 'No user variables provided',
        addVariable: 'Add variable',
    };

    private updateVariable(text: string, row: number, column: number) {
        const message: UpdateTableCellText = {
            'type': 'updateTableCellText',
            'id': this.variables['id'],
            'newText': text,
            'editableRow': row,
            'column': column,
        };
        parent.postMessage(message, '*');
    }

    protected updateVariableName(e: Event, row: number) {
        const text = (e.target as HTMLElement).innerText.trim();
        this.updateVariable(text, row, 0);
    }

    protected updateVariableValue(e: Event, row: number) {
        const text = (e.target as HTMLElement).innerText.trim();
        this.updateVariable(text, row, 1);
    }

    protected addVariable() {
        const message: AddTableRow = {
            'type': 'addTableRow',
            'id': this.variables['id'],
        };
        parent.postMessage(message, '*');
        this.variables.variables.push(['', '']);
    }

    protected deleteVariable(row: number) {
        const message: DeleteTableRow = {
            'type': 'deleteTableRow',
            'id': this.variables['id'],
            'editableRow': row,
        };
        parent.postMessage(message, '*');
        this.variables.variables.splice(row, 1);
    }
}
