import {EditorClient, LucidCardIntegrationRegistry} from 'lucid-extension-sdk';
import {TodoistCardIntegration} from './todoistcardintegration';

const editorClient = new EditorClient();
const cardIntegration = new TodoistCardIntegration(editorClient);
LucidCardIntegrationRegistry.addCardIntegration(editorClient, cardIntegration);
