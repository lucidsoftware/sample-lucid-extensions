import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component} from '@angular/core';
import {
    AiBlockType,
    SerializedAiBlock,
    SerializedSystemPrompt,
    SerializedUserPrompt,
    isExamples,
    isOutput,
    isPromptSegment,
    isSystemPrompt,
    isUserPrompt,
    isVariablesTable,
} from '@extension/blocks/serializedblocks';
import {ButtonComponent} from '@shared';
import {Subscription} from 'rxjs';
import {ExamplesComponent} from './examples/examples.component';
import {ExtensionProxy} from './extensionproxy';
import {OutputComponent} from './output/output.component';
import {PromptSegmentComponent} from './promptsegment/promptsegment.component';
import {SystemPromptComponent} from './systemprompt/systemprompt.component';
import {UserPromptComponent} from './userprompt/userprompt.component';
import {VariablesComponent} from './variables/variables.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        SystemPromptComponent,
        UserPromptComponent,
        OutputComponent,
        PromptSegmentComponent,
        VariablesComponent,
        ExamplesComponent,
        ButtonComponent,
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent {
    protected phrases = {
        // TODO i18n
        systemPrompt: 'System Prompt',
        userPrompt: 'User Prompt',
        output: 'Output',
        promptSegment: 'Global Variable',
        userVariables: 'User Provided Variables',
        userExamples: 'Few Shot Learning Examples',
        multipleShapes: 'Multiple Shapes',
        noShapeSelected: 'No AI shape selected',
        selectedShape: 'Selected Shape',
        executePrompts: () => {
            if (this.executableSelection?.length == 1) {
                return 'Execute prompt';
            }
            return 'Execute prompts';
        },
        xOutOfYArePrompts: () => {
            return `${this.executableSelection?.length ?? '0'} out of ${
                this.currentSelection.length
            } selected shapes are prompts`;
        },
    };
    // make accessible to template
    protected AiBlockType = AiBlockType;
    protected isSystemPrompt = isSystemPrompt;
    protected isUserPrompt = isUserPrompt;
    protected isOutput = isOutput;
    protected isPromptSegment = isPromptSegment;
    protected isVariablesTable = isVariablesTable;
    protected isExamples = isExamples;

    private selectionSubscription!: Subscription;
    protected currentSelection: SerializedAiBlock[] = [];
    protected get singleSelection(): SerializedAiBlock | undefined {
        if (this.currentSelection.length == 1) {
            return this.currentSelection[0];
        }
        return undefined;
    }

    protected get executableSelection(): SerializedAiBlock[] {
        return this.currentSelection.filter((block) => {
            return isSystemPrompt(block) || isUserPrompt(block);
        });
    }

    private isSystemPromptExecutable(block: SerializedSystemPrompt): boolean {
        return !!block['model'] && block['count-of-user-prompts'] > 0 && this.availableModels.includes(block['model']);
    }

    private isUserPromptExecutable(block: SerializedUserPrompt): boolean {
        return !!block['model-used'] && this.availableModels.includes(block['model-used']);
    }

    protected get shouldExecutionDisabled(): boolean {
        return !this.executableSelection.find((block) => {
            return (
                (isSystemPrompt(block) && this.isSystemPromptExecutable(block)) ||
                (isUserPrompt(block) && this.isUserPromptExecutable(block))
            );
        });
    }

    private availableModelsSubscription: Subscription | undefined;
    protected availableModels: string[] = [];

    private executingSubscription: Subscription | undefined;
    protected executing: boolean = false;

    private isExecuteFailedSubscription: Subscription | undefined;
    protected isExecuteFailed: boolean = false;

    private updatePromptTextSubscription: Subscription | undefined;
    private updateTableCellTextSubscription: Subscription | undefined;

    constructor(
        protected readonly extension: ExtensionProxy,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    public ngOnInit() {
        this.selectionSubscription = this.extension.currentSelection.subscribe((currentSelection) => {
            this.currentSelection = currentSelection;
            this.cdr.detectChanges();
        });
        this.availableModelsSubscription = this.extension.availableModels.subscribe((availableModels) => {
            this.availableModels = availableModels;
            this.cdr.detectChanges();
        });
        this.executingSubscription = this.extension.executing.subscribe((isExecuting) => {
            this.executing = isExecuting;
            this.cdr.detectChanges();
        });
        this.isExecuteFailedSubscription = this.extension.executeFailed.subscribe((isExecuteFailed) => {
            this.isExecuteFailed = isExecuteFailed;
            this.cdr.detectChanges();
        });
        this.updatePromptTextSubscription = this.extension.updatePromptText.subscribe((event) => {
            if (event !== undefined) {
                this.updatePromptText(event.id, event.text);
                this.cdr.detectChanges();
            }
        });
        this.updateTableCellTextSubscription = this.extension.updateTableCellText.subscribe((event) => {
            if (event !== undefined) {
                this.updateTableCellText(event.row, event.column, event.text);
                this.cdr.detectChanges();
            }
        });
    }

    public ngOnDestroy() {
        this.selectionSubscription?.unsubscribe();
        this.availableModelsSubscription?.unsubscribe();
        this.executingSubscription?.unsubscribe();
        this.isExecuteFailedSubscription?.unsubscribe();
        this.updatePromptTextSubscription?.unsubscribe();
        this.updateTableCellTextSubscription?.unsubscribe();
    }

    private updatePromptText(id: string, text: string) {
        if (this.singleSelection !== undefined) {
            if (isSystemPrompt(this.singleSelection)) {
                this.singleSelection['system-prompt'] = text;
            } else if (isUserPrompt(this.singleSelection)) {
                this.singleSelection['user-prompt'] = text;
            } else if (isPromptSegment(this.singleSelection)) {
                if (id.endsWith('SegmentName')) {
                    this.singleSelection['segment-name'] = text;
                } else if (id.endsWith('PromptSegmentContent')) {
                    this.singleSelection['segment-value'] = text;
                }
            }
        }
    }

    private updateTableCellText(row: number, column: number, text: string) {
        // The row number of the table is +2 of the variables or examples array because it has a roww for table name and
        // column headers
        if (row < 2) {
            return;
        }

        const shiftedRow = row - 2;
        if (this.singleSelection !== undefined) {
            if (isVariablesTable(this.singleSelection)) {
                this.singleSelection['variables'][shiftedRow][column] = text;
            } else if (isExamples(this.singleSelection)) {
                this.singleSelection['examples'][shiftedRow][column] = text;
            }
        }
    }

    protected getImageSrc(): string {
        if (this.currentSelection.length == 1) {
            switch (this.currentSelection[0]['block-type']) {
                case AiBlockType.SystemPrompt:
                    return 'system-prompt.svg';
                case AiBlockType.UserPrompt:
                    return 'user-prompt.svg';
                case AiBlockType.PromptSegment:
                    return 'prompt-segment.svg';
                case AiBlockType.Examples:
                    return 'sample-interactions.svg';
                case AiBlockType.VariablesTable:
                    return 'user-variables.svg';
                case AiBlockType.Output:
                    return 'output.svg';
            }
        } else if (this.currentSelection.length == 0) {
            return 'SelectArrow24.svg';
        } else {
            return 'multiple-shapes.svg';
        }
    }
    protected getShapeName(): string {
        if (this.currentSelection.length == 1) {
            switch (this.currentSelection[0]['block-type']) {
                case AiBlockType.SystemPrompt:
                    return this.phrases.systemPrompt;
                case AiBlockType.UserPrompt:
                    return this.phrases.userPrompt;
                case AiBlockType.PromptSegment:
                    return this.phrases.promptSegment;
                case AiBlockType.Examples:
                    return this.phrases.userExamples;
                case AiBlockType.VariablesTable:
                    return this.phrases.userVariables;
                case AiBlockType.Output:
                    return this.phrases.output;
            }
        } else if (this.currentSelection.length == 0) {
            return this.phrases.noShapeSelected;
        } else {
            return this.phrases.multipleShapes;
        }
    }

    protected executePrompts() {
        if (this.executableSelection) {
            this.executing = true;
            parent.postMessage(
                {'type': 'executePrompts', 'ids': this.executableSelection.map((block) => block['id'])},
                '*',
            );
        }
    }
}
