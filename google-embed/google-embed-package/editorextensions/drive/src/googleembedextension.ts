import { EditorClient, Menu, MenuType, UnfurlDetails, Viewport } from 'lucid-extension-sdk';
import { DriveClient } from './client/driveclient';
import { GoogleDrivePickerModal } from './picker/googledrivepickermodal';
import { DriveUnfurl } from './unfurls/driveunfurl';

export class GoogleEmbedExtension {
    /**
     * Regex matching the normal Google docs format (docs.google.com) which extracts the id
     */
    private readonly documentRegex = /^https:\/\/docs\.google\.com\/\w+\/d\/([a-zA-Z0-9-_]+)/;

    /**
     * Regex matching the normal Google drive format (drive.google.com) which extracts the id
     */
    private readonly driveFolderRegex =
        /^https:\/\/drive\.google\.com\/(?:drive\/(?:u\/0\/)?folders|file\/d)\/([a-zA-Z0-9-_]+)/;

    /**
     * The name of the file picker action
     */
    private readonly filePickerActionName: string = 'openFilePicker';

    private readonly googleEmbedDomains: string[] = [
        'docs.google.com',
        'drive.google.com',
    ]

    constructor(
        private readonly editorClient: EditorClient,
        private readonly driveClient: DriveClient,
    ) { }

    public init() {
        this.googleEmbedDomains.forEach(domain => this.editorClient.registerUnfurlHandler(domain, {
            unfurlCallback: this.performUnfurl.bind(this),
        }))

        this.initFilePicker();
    }

    private initFilePicker() {
        this.editorClient.registerAction(this.filePickerActionName, async () => {
            const result = await this.openFilePicker();
            new Viewport(this.editorClient).getCurrentPage()?.importLinks(result);
        });

        new Menu(this.editorClient).addMenuItem({
            label: 'Google Drive',
            iconUrl: 'https://cdn-cashy-static-assets.lucidchart.com/app/google-workspace/GoogleDriveLogo24.svg',
            action: this.filePickerActionName,
            menuType: MenuType.ContentDock,
        });
    }

    private async performUnfurl(url: string): Promise<UnfurlDetails | undefined> {
        const id = this.extractIdOfGoogleEntity(url);
        if (id) {
            try {
                const driveResponse = await this.driveClient.getDriveFileDetails(id);
                if (!driveResponse) {
                    return undefined;
                }
                const permanentThumbnailUrl = !!driveResponse.thumbnailLink ? (await this.getPermanentThumbanilUrl(driveResponse.thumbnailLink)) : undefined;
                const unfurl = new DriveUnfurl(driveResponse, permanentThumbnailUrl);
                return unfurl.getUnfurlDetails();
            } catch (error) {
                console.log('Unexpected error performaning Google Embed unfurl', error);
            }
        }
        return undefined;
    }

    /**
     * Extracts the id of the Google doc or Google drive file
     * @param url The url to extract from
     * @returns The id extracted
     */
    private extractIdOfGoogleEntity(url: string): string | undefined {
        return (
            this.documentRegex.exec(url)?.[1] ??
            this.driveFolderRegex.exec(url)?.[1]
        );
    }

    /**
     * Gets the permanent url for a thumbnail from a short lived url
     */
    private async getPermanentThumbanilUrl(shortLivedThumbnailUrl: string): Promise<string | undefined> {
        try {
            const thumbnailData = await this.driveClient.getDriveImageBytes(shortLivedThumbnailUrl);
            if (!thumbnailData) {
                return undefined;
            }
            return await this.editorClient.experimentalCreateUserImage('image/png', thumbnailData);
        } catch {
            // If an error occurs, simply return undefined and unfurl without a preview
        }
        return undefined;
    }

    private async openFilePicker(): Promise<string[]> {
        try {
            const token = await this.driveClient.getOAuthToken();
            if (token) {
                const picker = new GoogleDrivePickerModal(this.editorClient, token);
                const pickerResult = await picker.getPickerResult();
                switch (pickerResult.action) {
                    case 'picked':
                        return pickerResult.docUrls;
                    case 'cancel':
                        return [];
                }
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    }
}
