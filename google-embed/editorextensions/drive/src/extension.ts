import { EditorClient } from 'lucid-extension-sdk';
import { GoogleEmbedExtension } from './googleembedextension';
import { DriveClient } from './client/driveclient';
import { setupI18n } from './i18n/googledrivei18n';

setupI18n();

const editorClient = new EditorClient();
const driveClient = new DriveClient('googleembedexample', editorClient);

new GoogleEmbedExtension(editorClient, driveClient).init();
