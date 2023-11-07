import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Output} from '@angular/core';
import {ButtonComponent} from '@shared';

@Component({
    selector: 'app-feedback-form',
    templateUrl: './feedbackform.component.html',
    styleUrls: ['./feedbackform.component.less'],
    standalone: true,
    imports: [CommonModule, ButtonComponent],
})
export class FeedbackFormComponent {
    @Output() public close = new EventEmitter();

    protected rating = 0;
    protected feedback = '';

    protected phrases = {
        // TODO i18n
        title: 'Feedback',
        ratingQuestion: 'How would you rate this extension?',
        feedbackPrompt: 'Any additional feedback',
        feedbackPlaceholder: 'Describe your experience using this product',
        submit: 'Submit',
    };

    constructor() {}

    public submit() {
        parent.postMessage(
            {
                'message': 'feedback',
                'rating': this.rating,
                'feedback': this.feedback,
            },
            '*',
        );

        //Clear the form and close it
        this.rating = 0;
        this.feedback = '';
        this.close.emit();
    }
}
