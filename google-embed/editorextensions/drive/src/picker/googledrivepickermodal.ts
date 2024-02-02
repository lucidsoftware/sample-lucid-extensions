import {
    arrayValidator,
    EditorClient,
    either,
    GuardToType,
    isString,
    Modal,
    objectValidator,
    someValue,
} from 'lucid-extension-sdk';
import content from '../../resources/googledrivepicker.html';
import { getGoogleDriveLocale } from '../i18n/googledrivelocale';

export type PickerResult = GuardToType<typeof isPickerResult>;
export const isPickerResult = either(
    objectValidator({ 'action': someValue('cancel', 'error') }),
    objectValidator({ 'action': someValue('picked'), 'docUrls': arrayValidator(isString) }),
);

export class GoogleDrivePickerModal extends Modal {
    constructor(client: EditorClient, private readonly accessToken: string) {
        super(client, { content, chromeless: true, fullScreen: true, transparentBackground: true });
        this.pickerPromise = new Promise<PickerResult>((resolve) => {
            this.pickerPromiseResolve = resolve;
        });
        this.show();
    }

    private pickerPromise: Promise<PickerResult>;
    private pickerPromiseResolve: (pickerResult: PickerResult) => void = () => { };

    protected frameLoaded(): void {
        this.sendMessage({
            'action': 'init',
            'accessToken': this.accessToken,
            'locale': getGoogleDriveLocale(),
            'title': i18n.get('editor-extension-link-importer-file-picker-modal-title'),
        });
    }

    protected frameClosed(): void {
        this.pickerPromiseResolve({ action: 'cancel' });
    }

    public getPickerResult(): Promise<PickerResult> {
        return this.pickerPromise;
    }

    protected messageFromFrame(message: PickerResult | unknown): void {
        if (isPickerResult(message)) {
            this.pickerPromiseResolve(message);
            this.hide();
        }
    }
}
