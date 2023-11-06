import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {SerializedPromptSegment} from '@extension/blocks/serializedblocks';

@Component({
    selector: 'app-prompt-segment',
    templateUrl: './promptsegment.component.html',
    standalone: true,
    styleUrls: ['./promptsegment.component.less'],
    imports: [CommonModule],
})
export class PromptSegmentComponent {
    @Input({required: true}) promptSegment!: SerializedPromptSegment;

    protected phrases = {
        // TODO i18n
        segmentName: 'Variable Name',
        segmentValue: 'Value',
    };

    public updateSegmentValue(e: Event) {
        this.updateTextArea(e, 'PromptSegmentContent');
    }

    public updateSegmentName(e: Event) {
        this.updateTextArea(e, 'SegmentName');
    }

    private updateTextArea(e: Event, textAreaName: string) {
        const text = (e.target as HTMLElement).innerText;
        parent.postMessage(
            {'type': 'updateBlockText', 'id': this.promptSegment['id'], 'newText': text, 'textAreaName': textAreaName},
            '*',
        );
    }
}
