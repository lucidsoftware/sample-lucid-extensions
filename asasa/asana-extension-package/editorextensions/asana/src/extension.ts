import {EditorClient, LucidCardIntegrationRegistry} from 'lucid-extension-sdk';
import {AsanaCardIntegration} from './asanacardintegration';

const editorClient = new EditorClient();
const asanacardintegration = new AsanaCardIntegration(editorClient);
LucidCardIntegrationRegistry.addCardIntegration(editorClient, asanacardintegration);
