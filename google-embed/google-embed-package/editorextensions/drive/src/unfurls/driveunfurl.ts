import { UnfurlDetails } from 'lucid-extension-sdk';
import { DriveFileResponse } from '../client/drivefileresponse';
import { DriveMimeType } from '../client/drivemimetype';

/**
 * Represents a single Link Unfurl for a Google Drive file
 */
export class DriveUnfurl {
    private static readonly defaultProviderName = 'Google Drive';
    private static readonly mimeTypeToNameMap: { [key in DriveMimeType]: string } = {
        [DriveMimeType.Document]: 'Google Docs',
        [DriveMimeType.Presentation]: 'Google Slides',
        [DriveMimeType.Spreadsheet]: 'Google Sheets',
    };

    private static getProviderName(mimeType: DriveMimeType | undefined): string {
        return mimeType ? DriveUnfurl.mimeTypeToNameMap[mimeType] : DriveUnfurl.defaultProviderName;
    }

    // A fallback icon if the unfurl does no provide one
    private static readonly fallBackFaviconUrl =
        'https://cdn-cashy-static-assets.lucidchart.com/app/google-workspace/GoogleDriveLogo24.svg';

    private readonly title: string;
    private readonly mimeType?: DriveMimeType;
    private readonly iconLink?: string;
    private readonly webViewLink?: string;

    constructor(
        driveResponse: DriveFileResponse,
        private readonly permanentThumbnailUrl: string | undefined,
    ) {
        this.title = driveResponse.name ?? 'unknown';
        this.mimeType = driveResponse.mimeType;
        this.iconLink = driveResponse.iconLink;
        this.webViewLink = driveResponse.webViewLink;
    }

    public getUnfurlDetails(): UnfurlDetails | undefined {
        const iframeUrl = this.webViewLink;
        return {
            providerName: DriveUnfurl.getProviderName(this.mimeType),
            providerFaviconUrl: this.getIconUrl(),
            unfurlTitle: this.title,
            previewImageUrl: this.permanentThumbnailUrl,
            ...(iframeUrl ? { iframe: { iframeUrl: iframeUrl } } : undefined),
        };
    }

    private getIconUrl(): string {
        if (this.iconLink) {
            // Scale the icon up from the default 16px to 64px
            return this.iconLink.replace('16', '64');
        } else {
            return DriveUnfurl.fallBackFaviconUrl;
        }
    }
}
