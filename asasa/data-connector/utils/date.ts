import {SerializedIsoDateObject, SerializedLucidDateObject} from 'lucid-extension-sdk';

export function getFormattedDateOrTime(rawDate: string | null, rawTime: string | null): SerializedIsoDateObject | null {
    if (rawTime) {
        return getFormattedTime(rawTime);
    } else if (rawDate) {
        return {
            // asana promises that start_on / due_on will be YYYY-MM-DD
            'isoDate': rawDate,
        };
    } else {
        return null;
    }
}

export function getFormattedTimeOptional(rawTime: string | null): SerializedIsoDateObject | null {
    return rawTime ? getFormattedTime(rawTime) : null;
}

export function getFormattedTime(rawTime: string): SerializedIsoDateObject {
    return {
        // asana promises that start_at / due_at will be ISO UTC
        'isoDate': rawTime,
    };
}

export function asanaDate<Prefix extends string>(
    prefix: Prefix,
    date: SerializedLucidDateObject | undefined | null,
): {
    [x in `${Prefix}on` | `${Prefix}at`]?: string | null;
} {
    if (date !== undefined) {
        if (date === null) {
            return {[`${prefix}on`]: null, [`${prefix}at`]: null} as {
                [x in `${Prefix}on` | `${Prefix}at`]?: null;
            };
        }
        if ('ms' in date && date.isDateOnly) {
            return {[`${prefix}on`]: new Date(date.ms).toISOString().split('T')[0]} as {
                [x in `${Prefix}on` | `${Prefix}at`]?: string;
            };
        } else if ('ms' in date) {
            return {[`${prefix}at`]: new Date(date.ms).toISOString()} as {
                [x in `${Prefix}on` | `${Prefix}at`]?: string;
            };
        } else {
            if (date['isoDate'].split('T').length === 1) {
                return {[`${prefix}on`]: date.isoDate} as {
                    [x in `${Prefix}on` | `${Prefix}at`]?: string;
                };
            } else {
                return {[`${prefix}at`]: date.isoDate} as {
                    [x in `${Prefix}on` | `${Prefix}at`]?: string;
                };
            }
        }
    }
    return {};
}
