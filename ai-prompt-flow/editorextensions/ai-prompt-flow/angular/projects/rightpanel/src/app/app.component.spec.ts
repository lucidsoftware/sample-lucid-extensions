import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    AiBlockType,
    SerializedExamplesBlock,
    SerializedOutputBlock,
    SerializedPromptSegment,
    SerializedSystemPrompt,
    SerializedUserPrompt,
    SerializedVariablesTable,
} from '@extension/blocks/serializedblocks';
import {AppComponent} from './app.component';
import {MockParent} from './parent.mock';

describe('AI Prompt Flow Right Panel', () => {
    let mockParent: MockParent;
    let fixture: ComponentFixture<AppComponent>;
    let element: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppComponent],
        });
        fixture = TestBed.createComponent(AppComponent);
        window.dispatchEvent(new Event('load'));
        fixture.detectChanges();
        element = fixture.nativeElement;

        mockParent = new MockParent();
        spyOn(window.parent, 'postMessage').and.callFake(mockParent.postMessage.bind(mockParent));
    });

    // describe('with no shapes selected', async () => {
    //     // TODO
    // });

    // describe('with no executable AI blocks selected', async () => {
    //     // TODO
    // });

    // describe('with executable AI blocks selected', async () => {
    //     // TODO
    // });

    // Rather than testing each component individually, I've opted to test them from the context of
    // the parent component. This will help ensure that changes propagate to the child components
    // when the selection changes.
    describe('with a system prompt', () => {
        let systemPromptElement: HTMLElement | null;
        beforeEach(() => {
            const systemPrompt: SerializedSystemPrompt = {
                'id': 'system-prompt',
                'block-type': AiBlockType.SystemPrompt,
                'system-prompt': 'This is the system prompt.',
                'count-of-user-prompts': 1,
                'model': 'Testing Model',
            };
            mockParent.setSelection([systemPrompt]);
            systemPromptElement = element.querySelector('app-system-prompt') as HTMLElement;
        });

        it('should show a icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('System Prompt');
        });

        it('should show the model', () => {
            const model = systemPromptElement?.querySelector('.model') as HTMLElement;
            expect(model.innerText).toBe('Model\nTesting Model\nAzure GPT-4\nPaLM 2');
        });

        it('should show the existing system prompt', () => {
            const prompt = systemPromptElement?.querySelector('.system-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the system prompt.');
        });

        // TODO should also show a warning icon
        it('should show if no user prompt is connected', () => {
            const systemPrompt: SerializedSystemPrompt = {
                'id': 'system-prompt',
                'block-type': AiBlockType.SystemPrompt,
                'system-prompt': 'This is the system prompt.',
                'count-of-user-prompts': 0,
                'model': 'Testing Model',
            };
            mockParent.setSelection([systemPrompt]);
            const userPromptCount = systemPromptElement?.querySelector('.user-prompt-count') as HTMLElement;
            expect(userPromptCount.innerText).toBe('No user prompts connected');
        });

        it('should show if a single user prompt is connected', () => {
            const userPromptCount = systemPromptElement?.querySelector('.user-prompt-count') as HTMLElement;
            expect(userPromptCount.innerText).toBe('1 user prompt connected');
        });

        it('should show if multiple user prompts are connected', () => {
            const systemPrompt: SerializedSystemPrompt = {
                'id': 'system-prompt',
                'block-type': AiBlockType.SystemPrompt,
                'system-prompt': 'This is the system prompt.',
                'count-of-user-prompts': 2,
                'model': 'Testing Model',
            };
            mockParent.setSelection([systemPrompt]);
            const userPromptCount = systemPromptElement?.querySelector('.user-prompt-count') as HTMLElement;
            expect(userPromptCount.innerText?.trim()).toBe('2 user prompts connected');
        });

        it('should allow the model to be edited', () => {
            const selectedModelSelect = systemPromptElement?.querySelector('.selected-model') as HTMLSelectElement;
            selectedModelSelect.value = 'PaLM 2';
            selectedModelSelect.dispatchEvent(new Event('change'));
            expect(mockParent.log.at(-1)).toEqual({'type': 'updateModel', 'id': 'system-prompt', 'model': 'PaLM 2'});
        });

        it('should allow the system prompt to be edited', () => {
            const systemPromptTextArea = systemPromptElement?.querySelector('.system-prompt') as HTMLElement;
            expect(systemPromptTextArea).toBeTruthy();
            const promptText = 'This is the new prompt text.';
            systemPromptTextArea.innerText = promptText;
            systemPromptTextArea.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateBlockText',
                'id': 'system-prompt',
                'newText': promptText,
            });
        });

        it('should execute the system prompt when the button is clicked', () => {
            const executePromptButton = systemPromptElement?.querySelector('.execute-prompt button') as HTMLElement;
            expect(executePromptButton).toBeTruthy();
            executePromptButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'executePrompts', 'ids': ['system-prompt']});
        });

        it('should modify system prompt if the block is edited', () => {
            const editedText = 'New system prompt';
            const prompt = systemPromptElement?.querySelector('.system-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the system prompt.');
            mockParent.sendResponse({
                'type': 'updatePromptText',
                'id': '0',
                'text': editedText,
            });
            expect(prompt.innerText).toBe(editedText);
        });
    });

    describe('with a user prompt', () => {
        let userPromptElement: HTMLElement | null;
        beforeEach(() => {
            const userPrompt: SerializedUserPrompt = {
                'id': 'user-prompt',
                'block-type': AiBlockType.UserPrompt,
                'system-prompt': 'This is the system prompt.',
                'user-prompt': 'This is the user prompt.',
                'model-used': 'Testing Model',
            };
            mockParent.setSelection([userPrompt]);
            userPromptElement = element.querySelector('app-user-prompt') as HTMLElement;
        });

        it('should show a icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('User Prompt');
        });

        it('should show the user prompt', () => {
            const prompt = userPromptElement?.querySelector('.user-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the user prompt.');
        });

        it('should allow the user prompt to be edited', () => {
            const userPromptTextArea = userPromptElement?.querySelector('.user-prompt') as HTMLElement;
            expect(userPromptTextArea).toBeTruthy();
            const promptText = 'This is the new user prompt text.';
            userPromptTextArea.innerText = promptText;
            userPromptTextArea.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateBlockText',
                'id': 'user-prompt',
                'newText': promptText,
            });
        });

        it('should show a connected system prompt', () => {
            const prompt = userPromptElement?.querySelector('.system-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the system prompt.');
        });

        it('should show the model if available', () => {
            const model = userPromptElement?.querySelector('.model') as HTMLElement;
            expect(model.innerText).toBe('Model used\nTesting Model');
        });

        // TODO also show an icon
        it('should show if no system prompt is connected', () => {
            const userPrompt: SerializedUserPrompt = {
                'id': 'user-prompt',
                'block-type': AiBlockType.UserPrompt,
                'user-prompt': 'This is the user prompt.',
                'system-prompt': undefined,
                'model-used': undefined,
            };
            mockParent.setSelection([userPrompt]);
            const systemPrompt = userPromptElement?.querySelector('.system-prompt-invalid') as HTMLElement;
            expect(systemPrompt.textContent).toBe('No system prompt connected');
        });

        it('should execute the user prompt when the button is clicked', () => {
            const executePromptButton = userPromptElement?.querySelector('.execute-prompt button') as HTMLElement;
            expect(executePromptButton).toBeTruthy();
            executePromptButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'executePrompts', 'ids': ['user-prompt']});
        });

        it('should modify user prompt if the block is edited', () => {
            const editedText = 'New user prompt';
            const prompt = userPromptElement?.querySelector('.user-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the user prompt.');
            mockParent.sendResponse({
                'type': 'updatePromptText',
                'id': '0',
                'text': editedText,
            });
            expect(prompt.innerText).toBe(editedText);
        });
    });

    describe('with an output block', () => {
        let outputElement: HTMLElement | null;
        beforeEach(() => {
            const output: SerializedOutputBlock = {
                'id': 'response',
                'block-type': AiBlockType.Output,
                'model-used': 'Testing Model',
                'timestamp': 1693229252043,
                'system-prompt': 'This is the system prompt.',
                'user-prompt': 'This is the user prompt.',
                'output': 'This is the output.',
            };
            mockParent.setSelection([output]);
            outputElement = element.querySelector('app-output') as HTMLElement;
        });

        it('should show a icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('Output');
        });

        it('should have a functioning copy button next to the output text', () => {
            const copyButton = outputElement?.querySelector('.copy-icon') as HTMLImageElement;
            expect(copyButton).toBeTruthy();

            let copiedText = '';
            spyOn(navigator.clipboard, 'writeText').and.callFake(async (text: string) => {
                copiedText = text;
            });

            copyButton.click();

            expect(copiedText).toBe('This is the output.');
        });

        it('should show the model used', () => {
            const model = outputElement?.querySelector('.model') as HTMLElement;
            expect(model.innerText).toBe('Model used\nTesting Model');
        });

        it('should show the output text', () => {
            const prompt = outputElement?.querySelector('.output') as HTMLElement;
            expect(prompt.innerText).toBe('This is the output.');
        });

        it('should show the system prompt', () => {
            const prompt = outputElement?.querySelector('.system-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the system prompt.');
        });

        it('should show the user prompt', () => {
            const prompt = outputElement?.querySelector('.user-prompt') as HTMLElement;
            expect(prompt.innerText).toBe('This is the user prompt.');
        });
    });

    describe('with a prompt segment', () => {
        let promptSegmentElement: HTMLElement | null;
        beforeEach(() => {
            const promptSegment: SerializedPromptSegment = {
                'id': 'prompt-segment',
                'block-type': AiBlockType.PromptSegment,
                'segment-name': 'Segment name',
                'segment-value': 'This is a global variable.',
            };
            mockParent.setSelection([promptSegment]);
            promptSegmentElement = element.querySelector('app-prompt-segment') as HTMLElement;
        });

        it('should show a icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('Global Variable');
        });

        it('should show the prompt segment', () => {
            const name = promptSegmentElement?.querySelector('.segment-name') as HTMLElement;
            const value = promptSegmentElement?.querySelector('.segment-value') as HTMLElement;
            expect(name.innerText).toBe('Segment name');
            expect(value.innerText).toBe('This is a global variable.');
        });

        it('should allow the name to be edited', () => {
            const nameElement = promptSegmentElement?.querySelector('.segment-name') as HTMLElement;
            expect(nameElement).toBeTruthy();
            const newText = 'New name';
            nameElement.textContent = newText;
            nameElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateBlockText',
                'id': 'prompt-segment',
                'newText': newText,
                'textAreaName': 'SegmentName',
            });
        });

        it('should allow the value to be edited', () => {
            const valueElement = promptSegmentElement?.querySelector('.segment-value') as HTMLElement;
            expect(valueElement).toBeTruthy();
            const newText = 'This is the new prompt segment value.';
            valueElement.textContent = newText;
            valueElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateBlockText',
                'id': 'prompt-segment',
                'newText': newText,
                'textAreaName': 'PromptSegmentContent',
            });
        });

        it('should modify segment name if the block is edited', () => {
            const editedText = 'New segment name';
            const name = promptSegmentElement?.querySelector('.segment-name') as HTMLElement;
            expect(name.innerText).toBe('Segment name');
            mockParent.sendResponse({
                'type': 'updatePromptText',
                'id': '0_SegmentName',
                'text': editedText,
            });
            expect(name.innerText).toBe(editedText);
        });

        it('should modify segment value if the block is edited', () => {
            const editedText = 'New segment value';
            const value = promptSegmentElement?.querySelector('.segment-value') as HTMLElement;
            expect(value.innerText).toBe('This is a global variable.');
            mockParent.sendResponse({
                'type': 'updatePromptText',
                'id': '0_PromptSegmentContent',
                'text': editedText,
            });
            expect(value.innerText).toBe(editedText);
        });
    });

    describe('with variables', () => {
        let variablesElement: HTMLElement | null;
        beforeEach(() => {
            const variablesBlock: SerializedVariablesTable = {
                'id': 'variables',
                'block-type': AiBlockType.VariablesTable,
                'variables': [
                    ['var1', 'This is variable 1'],
                    ['var2', 'This is variable 2'],
                ],
            };
            mockParent.setSelection([variablesBlock]);
            variablesElement = element.querySelector('app-variables') as HTMLElement;
        });

        it('should show a icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('User Provided Variables');
        });

        it('should allow the variable name to be edited', () => {
            const variableNameElement = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-name') ?? [],
            )[1] as HTMLElement;
            const newText = 'New name';
            variableNameElement.innerText = newText;
            variableNameElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateTableCellText',
                'id': 'variables',
                'newText': newText,
                'editableRow': 1,
                'column': 0,
            });
        });

        it('should allow the variable value to be edited', () => {
            const variableValueElement = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-value') ?? [],
            )[1] as HTMLElement;
            const newText = 'New value';
            variableValueElement.innerText = newText;
            variableValueElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateTableCellText',
                'id': 'variables',
                'newText': newText,
                'editableRow': 1,
                'column': 1,
            });
        });

        // TODO also show an icon
        it('should show if no user variables are provided', () => {
            const variablesBlock: SerializedVariablesTable = {
                'id': 'variables',
                'block-type': AiBlockType.VariablesTable,
                'variables': [],
            };
            mockParent.setSelection([variablesBlock]);
            const noVariables = variablesElement?.querySelector('.no-variables-provided') as HTMLElement;
            expect(noVariables.innerText).toBe('No user variables provided');
        });

        it('should show the user variables if provided', () => {
            const table = variablesElement?.querySelector('.variables-table') as HTMLElement;
            expect(table).toBeTruthy();

            expect(table.innerText).toBe('Name\nValue\nvar1\nThis is variable 1\nvar2\nThis is variable 2');
        });

        it('should show the user variables if the key is empty', () => {
            const variablesBlock: SerializedVariablesTable = {
                'id': 'variables',
                'block-type': AiBlockType.VariablesTable,
                'variables': [['', 'Only a value']],
            };
            mockParent.setSelection([variablesBlock]);
            const table = variablesElement?.querySelector('.variables-table') as HTMLElement;
            expect(table).toBeTruthy();

            expect(table.innerText).toBe('Name\nValue\nOnly a value');
        });

        it('should show the user variables if the value is empty', () => {
            const variablesBlock: SerializedVariablesTable = {
                'id': 'variables',
                'block-type': AiBlockType.VariablesTable,
                'variables': [['Only a key', '']],
            };
            mockParent.setSelection([variablesBlock]);
            const table = variablesElement?.querySelector('.variables-table') as HTMLElement;
            expect(table).toBeTruthy();

            expect(table.innerText).toBe('Name\nValue\nOnly a key');
        });

        it('should allow a variable to be added', () => {
            const addVariableButton = variablesElement?.querySelector('.add-variable button') as HTMLElement;
            expect(addVariableButton).toBeTruthy();
            addVariableButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'addTableRow', 'id': 'variables'});
        });

        it('should allow a variable to be deleted', () => {
            const deleteVariableButton = Array.from(
                variablesElement?.querySelectorAll('.delete-variable') ?? [],
            )[1] as HTMLElement;
            expect(deleteVariableButton).toBeTruthy();
            deleteVariableButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'deleteTableRow', 'id': 'variables', 'editableRow': 1});
        });

        it('should modify variable name if the table cell of the block is edited', () => {
            const editedText = 'var3';

            const variableNameElement = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-name') ?? [],
            )[1] as HTMLElement;
            expect(variableNameElement.innerText).toBe('var2');
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 3,
                'column': 0,
                'text': editedText,
            });
            expect(variableNameElement.innerText).toBe('var3');
        });

        it('should modify variable value if the table cell of the block is edited', () => {
            const editedText = 'This is variable 3';

            const variableValueElement = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-value') ?? [],
            )[1] as HTMLElement;
            expect(variableValueElement.innerText).toBe('This is variable 2');
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 3,
                'column': 1,
                'text': editedText,
            });
            expect(variableValueElement.innerText).toBe('This is variable 3');
        });

        it('should not modify anything if the table name or the column headers are edited', () => {
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 1,
                'column': 0,
                'text': 'New column header',
            });
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 0,
                'column': 0,
                'text': 'New table name',
            });
            const variableNames = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-name') ?? [],
            ) as HTMLElement[];
            const variableValues = Array.from(
                variablesElement?.querySelectorAll('app-variables .variable-value') ?? [],
            ) as HTMLElement[];
            expect(variableNames[0].innerText).toBe('var1');
            expect(variableNames[1].innerText).toBe('var2');
            expect(variableValues[0].innerText).toBe('This is variable 1');
            expect(variableValues[1].innerText).toBe('This is variable 2');
        });
    });

    describe('with an example block', () => {
        let exampleElement: HTMLElement | null;
        beforeEach(() => {
            const exampleBlock: SerializedExamplesBlock = {
                'id': 'examples',
                'block-type': AiBlockType.Examples,
                'system-prompt': 'This is the system prompt.',
                'examples': [
                    ['User 1', 'Response 1'],
                    ['User 2', 'Response 2'],
                ],
            };
            mockParent.setSelection([exampleBlock]);
            exampleElement = element.querySelector('app-examples') as HTMLElement;
        });

        it('should show an icon/name pair', () => {
            const icon = element.querySelector('.icon') as HTMLImageElement;
            expect(icon).toBeInstanceOf(HTMLImageElement);

            const selectionName = element.querySelector('.selection-name') as HTMLElement;
            expect(selectionName.innerText).toBe('Few Shot Learning Examples');
        });

        it('should allow the user text to be edited', () => {
            const userTextElement = Array.from(
                exampleElement?.querySelectorAll('app-examples .user') ?? [],
            )[1] as HTMLElement;
            const newText = 'New user text';
            userTextElement.innerText = newText;
            userTextElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateTableCellText',
                'id': 'examples',
                'newText': newText,
                'editableRow': 1,
                'column': 0,
            });
        });

        it('should allow the response text to be edited', () => {
            const responseTextElement = Array.from(
                exampleElement?.querySelectorAll('app-examples .response') ?? [],
            )[1] as HTMLElement;
            const newText = 'New response text';
            responseTextElement.innerText = newText;
            responseTextElement.dispatchEvent(new Event('input'));
            expect(mockParent.log.at(-1)).toEqual({
                'type': 'updateTableCellText',
                'id': 'examples',
                'newText': newText,
                'editableRow': 1,
                'column': 1,
            });
        });

        it('should allow an example to be added', () => {
            const addExampleButton = exampleElement?.querySelector('.add-example button') as HTMLElement;
            expect(addExampleButton).toBeTruthy();
            addExampleButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'addTableRow', 'id': 'examples'});
        });

        it('should allow an example to be deleted', () => {
            const deleteExampleButton = Array.from(
                exampleElement?.querySelectorAll('.delete-example') ?? [],
            )[1] as HTMLElement;
            expect(deleteExampleButton).toBeTruthy();
            deleteExampleButton.click();
            expect(mockParent.log.at(-1)).toEqual({'type': 'deleteTableRow', 'id': 'examples', 'editableRow': 1});
        });

        it('should modify the user text if the table cell of the block is edited', () => {
            const editedText = 'User 3';

            const userTextElement = Array.from(
                exampleElement?.querySelectorAll('app-examples .user') ?? [],
            )[1] as HTMLElement;
            expect(userTextElement.innerText).toBe('User 2');
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 3,
                'column': 0,
                'text': editedText,
            });
            expect(userTextElement.innerText).toBe('User 3');
        });

        it('should modify the response text if the table cell of the block is edited', () => {
            const editedText = 'Response 3';

            const responseTextElement = Array.from(
                exampleElement?.querySelectorAll('app-examples .response') ?? [],
            )[1] as HTMLElement;
            expect(responseTextElement.innerText).toBe('Response 2');
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 3,
                'column': 1,
                'text': editedText,
            });
            expect(responseTextElement.innerText).toBe('Response 3');
        });

        it('should not modify anything if the table name or the column headers are edited', () => {
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 1,
                'column': 0,
                'text': 'New column header',
            });
            mockParent.sendResponse({
                'type': 'updateTableCellText',
                'row': 0,
                'column': 0,
                'text': 'New table name',
            });
            const userTexts = Array.from(exampleElement?.querySelectorAll('app-examples .user') ?? []) as HTMLElement[];
            const responseTexts = Array.from(
                exampleElement?.querySelectorAll('app-examples .response') ?? [],
            ) as HTMLElement[];
            expect(userTexts[0].innerText).toBe('User 1');
            expect(userTexts[1].innerText).toBe('User 2');
            expect(responseTexts[0].innerText).toBe('Response 1');
            expect(responseTexts[1].innerText).toBe('Response 2');
        });
    });
});
