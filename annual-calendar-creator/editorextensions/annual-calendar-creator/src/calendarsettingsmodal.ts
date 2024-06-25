import { EditorClient, Modal } from 'lucid-extension-sdk';
import { createAnnualCalendar } from './extension';

export interface CalendarSettingsModalMessage {
    'year': number,
    'language': string,
    'localizedMonths': string[],
    'localizedDays': string[]
}

export class CalendarSettingsModal extends Modal {
    constructor(client: EditorClient) {
        super(client, {
            title: 'Create Annual Calendar',
            width: 300,
            height: 200,
            url: 'calendarsettings.html',
        });
    }

    protected frameLoaded() {
        this.sendMessage({'message': 'Successfully passed message to iframe'});
    }

    protected messageFromFrame(message: CalendarSettingsModalMessage): void {
        createAnnualCalendar(message['year'], message['localizedMonths'], message['localizedDays']);

        this.hide();
    }
}
