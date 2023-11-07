import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonComponent} from '../button/button.component';

@Component({
    selector: 'app-callout',
    templateUrl: './callout.component.html',
    styleUrls: ['./callout.component.less'],
    standalone: true,
    imports: [ButtonComponent, CommonModule],
})
export class CalloutComponent {
    @Input({required: true}) calloutTitle!: string;
    @Input({required: true}) calloutText!: string;
    @Input() buttonText: string | undefined;

    @Output() buttonClicked = new EventEmitter<void>();

    onButtonClick() {
        this.buttonClicked.emit();
    }
}
