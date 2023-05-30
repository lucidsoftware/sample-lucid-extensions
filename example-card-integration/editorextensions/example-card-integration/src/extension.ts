import {EditorClient, LucidCardIntegrationRegistry} from 'lucid-extension-sdk';
import {ExampleLucidCardIntegration} from './examplecardintegration';

const client = new EditorClient();
const exampleCardIntegration = new ExampleLucidCardIntegration(client);
LucidCardIntegrationRegistry.addCardIntegration(client, exampleCardIntegration);
