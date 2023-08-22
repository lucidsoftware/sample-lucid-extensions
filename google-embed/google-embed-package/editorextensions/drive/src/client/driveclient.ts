import { EditorClient } from 'lucid-extension-sdk';
import { DriveFileResponse, fromRawDriveFileResponse } from './drivefileresponse';

/**
 * A client for interacting with the Google Drive data proxied through the Lucid Extension Editor client.
 */
export class DriveClient {
    private readonly isGoogleUserContentRegex = /^https:\/\/[\w]+\.googleusercontent\.com\//;
    constructor(private readonly oauthProviderName: string, private readonly editorClient: EditorClient) { }

    /**
     * Gets the basic details for a file in google drive
     * @param id  The id
     * @returns
     */
    public async getDriveFileDetails(id: string): Promise<DriveFileResponse | undefined> {
        const fields: string[] = [
            'iconLink',
            'mimeType',
            'name',
            'thumbnailLink',
            'webViewLink',
        ]
        try {
            const encodedFieldValue = fields.join('%2c')
            const response = await this.editorClient.oauthXhr(this.oauthProviderName, {
                url: `https://www.googleapis.com/drive/v3/files/${id}?fields=${encodedFieldValue}&supportsAllDrives=true`,
                method: 'GET',
                responseFormat: 'utf8',
            });
            if (response.status == 200 && response.responseText) {
                const fileJson = JSON.parse(response.responseText) as any;
                const driveResponse = fromRawDriveFileResponse(fileJson);
                return driveResponse;
            }
        } catch (error) {
            console.log('Unexpected error in request to Google Drive API', error);
        }
        return undefined;
    }

    /**
     * Gets the image bytes from the provided thumbnail
     * @param thumbnailUrl The url to make a request with
     * @returns
     */
    public async getDriveImageBytes(thumbnailUrl: string): Promise<Uint8Array | undefined> {
        try {
            if (this.isGoogleUserContentRegex.test(thumbnailUrl)) {
                const thumbnailResponse = await this.editorClient.xhr({
                    // Replace the size parameter with a larger size to improve the quality of the embed
                    url: thumbnailUrl.replace('=s220', '=s1600'),
                    method: 'GET',
                    responseFormat: 'binary',
                });
                if (thumbnailResponse.status === 200) {
                    return thumbnailResponse.responseData;
                }
            }
            const thumbnailResponse = await this.editorClient.oauthXhr(this.oauthProviderName, {
                // Replace the size parameter with a larger size to improve the quality of the embed
                url: thumbnailUrl.replace('&sz=s220', '&sz=s1600'),
                method: 'GET',
                responseFormat: 'binary',
            });
            if (thumbnailResponse.status === 200) {
                return thumbnailResponse.responseData;
            }
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    /**
     * Get's the OAuth token associated with the Google Drive connection
     */
    public async getOAuthToken(): Promise<string | undefined> {
        try {
            return await this.editorClient.getOAuthToken(this.oauthProviderName);
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }
}
