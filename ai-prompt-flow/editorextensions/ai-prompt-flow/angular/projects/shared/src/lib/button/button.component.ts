import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoadingDotsComponent} from '../loadingdots/loadingdots.component';

@Component({
    selector: 'shared-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.less'],
    standalone: true,
    imports: [CommonModule, LoadingDotsComponent],
})
export class ButtonComponent {
    @Input() public displayText: string | null = null;
    @Input() public disabled: boolean | null = false;
    @Input() public loading: boolean | null = false;
    @Input() public iconUrl?: string;
    @Input() public isSubmit = false;
    @Output() public onClicked = new EventEmitter<void>();

    protected click() {
        if (!this.disabled && !this.loading) {
            this.onClicked.emit();
        }
    }
}
