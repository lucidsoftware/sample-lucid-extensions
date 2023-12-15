import {CustomMenuItem, EditorClient, Menu, MenuType, Viewport} from 'lucid-extension-sdk';
import {TableBlockProxy} from 'lucid-extension-sdk/document/blockclasses/tableblockproxy';
import {SystemPromptBlock, UserPromptBlock, VariablesTableBlock} from './blocks/blocks';
import {EndpointsProxy} from './endpointsproxy';
import {CustomModelFactory} from './executor/custommodel';
import {PromptExecutor} from './executor/promptexecutor';
import {LeftPanel} from './leftpanel';
import {RightPanel} from './rightpanel/rightpanel';

const client = new EditorClient();
const menu = new Menu(client);
const viewport = new Viewport(client);
const endpointsProxy = new EndpointsProxy(client);
const customEndpointFactory = new CustomModelFactory(client, endpointsProxy);
const promptExecutor = new PromptExecutor(client, customEndpointFactory);

function getSingleSelectedPrompt() {
    const selection = viewport.getSelectedItems();
    if (selection.length == 1) {
        if (selection[0] instanceof SystemPromptBlock || selection[0] instanceof UserPromptBlock) {
            return selection[0];
        }

        if (selection[0] instanceof TableBlockProxy && selection[0].shapeData.get('isVariables')) {
            return new VariablesTableBlock(selection[0].id, client);
        }
    }
    return undefined;
}

client.registerAction('isPromptSelected', () => !!getSingleSelectedPrompt());

client.registerAction('executePrompt', () => {
    const prompt = getSingleSelectedPrompt();
    if (!prompt) {
        return;
    }

    promptExecutor.execute(prompt);
});

function addToMenus(menuTypes: MenuType[], item: Omit<CustomMenuItem, 'menuType'>) {
    menuTypes.forEach((menuType) => {
        menu.addMenuItem(Object.assign(item, {menuType}));
    });
}

addToMenus([MenuType.Main, MenuType.Context], {
    label: 'Execute prompt',
    visibleAction: 'isPromptSelected',
    action: 'executePrompt',
});

const rightPanel = new RightPanel(client, promptExecutor, endpointsProxy);
new LeftPanel(client, endpointsProxy, rightPanel);
