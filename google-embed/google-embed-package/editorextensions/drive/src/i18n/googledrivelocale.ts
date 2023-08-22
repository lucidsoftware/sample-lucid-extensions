// https://developers.google.com/drive/picker/guides/overview#i18n
type GoogleDriveLocale =
    | 'af'
    | 'am'
    | 'ar'
    | 'bg'
    | 'bn'
    | 'ca'
    | 'cs'
    | 'da'
    | 'de'
    | 'el'
    | 'en'
    | 'en-GB'
    | 'es'
    | 'es-419'
    | 'et'
    | 'eu'
    | 'fa'
    | 'fi'
    | 'fil'
    | 'fr'
    | 'fr-CA'
    | 'gl'
    | 'gu'
    | 'hi'
    | 'hr'
    | 'hu'
    | 'id'
    | 'is'
    | 'it'
    | 'iw'
    | 'ja'
    | 'kn'
    | 'ko'
    | 'lt'
    | 'lv'
    | 'ml'
    | 'mr'
    | 'ms'
    | 'nl'
    | 'no'
    | 'pl'
    | 'pt-BR'
    | 'pt-PT'
    | 'ro'
    | 'ru'
    | 'sk'
    | 'sl'
    | 'sr'
    | 'sv'
    | 'sw'
    | 'ta'
    | 'te'
    | 'th'
    | 'tr'
    | 'uk'
    | 'ur'
    | 'vi'
    | 'zh-CN'
    | 'zh-HK'
    | 'zh-TW'
    | 'zu';
type LucidLocale = i18n.Locale;

export function getGoogleDriveLocale(): GoogleDriveLocale {
    const i18nLocale = i18n.getLanguage();
    return lucidToGoogleDriveLocaleMapping[i18nLocale] ?? 'en-US';
}

const lucidToGoogleDriveLocaleMapping: Record<LucidLocale, GoogleDriveLocale> = {
    'de': 'de',
    'en': 'en',
    'es-LA': 'es',
    'fr-FR': 'fr',
    'it-IT': 'it',
    'ja': 'ja',
    'ko': 'ko',
    'nl': 'nl',
    'pl-PL': 'pl',
    'pt-BR': 'pt-BR',
    'ru': 'ru',
    'sv-SE': 'sv',
};
