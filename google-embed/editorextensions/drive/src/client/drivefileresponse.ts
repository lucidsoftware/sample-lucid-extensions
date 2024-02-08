import {
    either,
    isString,
    nullableOption,
    objectValidator,
    stringEnumValidator,
    Validator,
} from 'lucid-extension-sdk';
import { DriveMimeType } from './drivemimetype';

/**
 * The serialized response from the drive file endpoint
 */
export interface RawDriveFileResponse {
    'name'?: string | null;
    'iconLink'?: string | null;
    'mimeType': DriveMimeType | string;
    'thumbnailLink'?: string | null;
    'webViewLink'?: string | null;
}

/**
 * The deserialized response from the drive file endpoint
 */
export interface DriveFileResponse {
    /**
     * File name
     */
    name?: string;
    /**
     * The icon that shows up in google (google product, or icon based on mime type)
     */
    iconLink?: string;
    /**
     * The type of file in drive.
     * If undefined, we don't recognize the type, so we can do default handling only.
     */
    mimeType?: DriveMimeType;
    /**
     * The link to the thumbnail in drive. This is usually the first page or a low quality image
     */
    thumbnailLink?: string;
    /**
     * The link to a web view which can be iframed
     */
    webViewLink?: string;
}

export const isRawDriveFileResponse: Validator<RawDriveFileResponse> = objectValidator({
    'name': nullableOption(isString),
    'iconLink': nullableOption(isString),
    'mimeType': either(stringEnumValidator(DriveMimeType), isString),
    'thumbnailLink': nullableOption(isString),
    'webViewLink': nullableOption(isString),
});

export function fromRawDriveFileResponse(raw: unknown): DriveFileResponse | undefined {
    if (isRawDriveFileResponse(raw)) {
        return {
            name: raw['name'] ?? undefined,
            iconLink: raw['iconLink'] ?? undefined,
            // If this is not an enumerated value, then use undefined
            mimeType: stringEnumValidator(DriveMimeType)(raw['mimeType']) ? raw['mimeType'] : undefined,
            thumbnailLink: raw['thumbnailLink'] ?? undefined,
            webViewLink: raw['webViewLink'] ?? undefined,
        };
    } else {
        return undefined;
    }
}
