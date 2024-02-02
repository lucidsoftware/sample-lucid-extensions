import * as i18nDe from '../../resources/i18n/de.json';
import * as i18nEn from '../../resources/i18n/en.json';
import * as i18nEsLA from '../../resources/i18n/es-LA.json';
import * as i18nFrFR from '../../resources/i18n/fr-FR.json';
import * as i18nItIT from '../../resources/i18n/it-IT.json';
import * as i18nJa from '../../resources/i18n/ja.json';
import * as i18nKo from '../../resources/i18n/ko.json';
import * as i18nNl from '../../resources/i18n/nl.json';
import * as i18nPlPL from '../../resources/i18n/pl-PL.json';
import * as i18nPtBR from '../../resources/i18n/pt-BR.json';
import * as i18nRu from '../../resources/i18n/ru.json';
import * as i18nSvSE from '../../resources/i18n/sv-SE.json';

export function setupI18n() {
    if (i18n.getLanguage() === 'de') {
        i18n.setData(i18nDe, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'en') {
        i18n.setData(i18nEn, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'es-LA') {
        i18n.setData(i18nEsLA, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'fr-FR') {
        i18n.setData(i18nFrFR, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'it-IT') {
        i18n.setData(i18nItIT, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'ja') {
        i18n.setData(i18nJa, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'ko') {
        i18n.setData(i18nKo, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'nl') {
        i18n.setData(i18nNl, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'pl-PL') {
        i18n.setData(i18nPlPL, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'pt-BR') {
        i18n.setData(i18nPtBR, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'ru') {
        i18n.setData(i18nRu, i18n.getLanguage());
    }
    if (i18n.getLanguage() === 'sv-SE') {
        i18n.setData(i18nSvSE, i18n.getLanguage());
    }
}
