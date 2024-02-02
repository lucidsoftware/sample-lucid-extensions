import {EditorClient, Modal} from 'lucid-extension-sdk';

export interface ImportModalSubmission {
    'docId': string;
    'pageNums': string;
}

export class ImportPageModal extends Modal {
    constructor(client: EditorClient) {
        super(client, {
            title: 'Import a document',
            width: 560,
            height: 312,
            url: 'import.html'
        });
    }

    protected messageFromFrame(data: ImportModalSubmission): void {
        const pageNums = data['pageNums'].split(',').map(str => Number(str.trim()));
        const docId = data['docId'].trim();
        this.importPage(docId, pageNums)

        this.hide();
    }

    protected importPage(docId: string, pageNums: number[]) {
        this.client.importPage(docId, pageNums);
    }
}
