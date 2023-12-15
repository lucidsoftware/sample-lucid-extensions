import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {SerializedOutputBlock} from '@extension/blocks/serializedblocks';

@Component({
    selector: 'app-output',
    templateUrl: './output.component.html',
    standalone: true,
    styleUrls: ['./output.component.less'],
    imports: [CommonModule],
})
export class OutputComponent {
    @Input({required: true}) output!: SerializedOutputBlock;

    protected phrases = {
        // TODO i18n
        output: 'Output',
        systemPrompt: 'System Prompt',
        userPrompt: 'User Prompt',
        modelUsed: 'Model used',
        createdAt: 'Created at',
    };

    protected createdAt(): string {
        function formatDate(timestamp: number) {
            const date = new Date(timestamp);
            const options: Intl.DateTimeFormatOptions = {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
        const timestamp = this.output['timestamp'];
        return timestamp ? formatDate(timestamp) : '';
    }

    protected async copy() {
        try {
            await navigator.clipboard.writeText(this.output['output']);
        } catch (err) {
            // The navigator.clipboard method isn't always supported in iframes,
            // see https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-permissions-in-cross-origin-iframes.
            // This alternative method using the deprecated `document.execCommand('copy')` works in those cases.
            // TODO add correct permissions to iframe if possible
            const textarea = document.createElement('textarea');
            textarea.value = this.output['output'];
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }
}
