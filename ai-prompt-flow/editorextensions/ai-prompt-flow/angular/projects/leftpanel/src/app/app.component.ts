import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CalloutComponent} from '@shared';
import {CollapsibleSectionComponent} from './collapsiblesection/collapsiblesection.component';
import {DefaultModelSelectorComponent} from './defaultmodelselector/defaultmodelselector.component';
import {FeedbackFormComponent} from './feedbackform/feedbackform.component';
import {PackageSettings} from './packagesettings.service';
import {SettingsComponent} from './settings/settings.component';
import {ShapeComponent} from './shape/shape.component';
import {Tab, TabsComponent} from './tabs/tabs.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    standalone: true,
    imports: [
        CommonModule,
        TabsComponent,
        CalloutComponent,
        CollapsibleSectionComponent,
        ShapeComponent,
        SettingsComponent,
        FormsModule,
        DefaultModelSelectorComponent,
        FeedbackFormComponent,
    ],
})
export class AppComponent {
    protected tabs: Tab[] = [
        {displayName: 'Shapes', id: 'shapes'},
        {displayName: 'Settings', id: 'settings'},
    ];
    protected activeTabId: string = 'shapes';
    protected showFeedbackForm = false;

    protected phrases = {
        // TODO i18n
        setupCalloutTitle: 'Setup',
        setupCalloutText: 'Connect your model to execute prompts on canvas',
        setupCalloutNoEditAccessText: 'Ask an account admin to connect a model to execute prompts on the canvas',
        setupCalloutButtonText: 'Connect model',
        promptShapes: 'Prompt Shapes',
        systemTooltip:
            'Provide instructions about how the LLM should behave. Good things to include are the purpose of the AI workflow, examples of inputs and outputs, and the format of your expected response.',
        userTooltip: 'Define your prompt. You can attach multiple user prompt shapes to one system prompt.',
        segmentTooltip:
            'Define a variable that can be applied by any user or system prompt on the canvas using the ${VariableName} notation.',
        variablesTooltip:
            'Define multiple variables and their values. Connect this shape to a user prompt shape and apply variables using the ${VariableName} notation.',
        samplesTooltip:
            'Specify a short list of example user prompts and your expected AI responses. Connect this shape to a system prompt to run few-shot learning on the provided examples before the user prompt is sent.',
    };

    protected shapes: {title: string; icon: string; id: string; tooltip: string}[] = [
        {title: 'System Prompt', icon: 'system-prompt.svg', id: 'system', tooltip: this.phrases.systemTooltip},
        {title: 'User Prompt', icon: 'user-prompt.svg', id: 'user', tooltip: this.phrases.userTooltip},
        {title: 'Global Variable', icon: 'prompt-segment.svg', id: 'segment', tooltip: this.phrases.segmentTooltip},
        {
            title: 'User Provided Variables',
            icon: 'user-variables.svg',
            id: 'variables',
            tooltip: this.phrases.variablesTooltip,
        },
        {
            title: 'Few Shot Learning Examples',
            icon: 'sample-interactions.svg',
            id: 'examples',
            tooltip: this.phrases.samplesTooltip,
        },
    ];

    protected get defaultModel(): string {
        return localStorage.getItem('defaultModel') ?? '';
    }

    private pointerDownEvent: PointerEvent | undefined;

    //As of the last pointer event, is the (captured) pointer outside the iframe's bounds?
    private pointerIsOut = false;

    private dragShape: string | undefined;
    private dragRemoteShape: string | undefined;
    private dragBranch: string | undefined;

    public masterNotLoaded: boolean = true;
    public masterOptions: string[] = [];

    public branchPromptOptions: Map<string, string[]> = new Map();

    public constructor(protected readonly packageSettings: PackageSettings) {
        window.addEventListener('message', this.windowMessage);
    }

    protected connectModel() {
        this.packageSettings.addNewEndpoint();
        this.activeTabId = 'settings';
    }

    private getTarget(): HTMLElement | undefined {
        const target = this.pointerDownEvent?.target;
        if (this.pointerDownEvent && target instanceof HTMLElement) {
            // Check if the target has a parent with class "shape" and set it as the target
            const shapeElement = target.closest('.shape');
            if (shapeElement instanceof HTMLElement) {
                return shapeElement;
            } else {
                return target;
            }
        }
        return undefined;
    }

    private documentPointerUp = (e: PointerEvent) => {
        if (this.pointerIsOut) {
            //Notify the editor that it needs to simulate canvas pointer events
            parent.postMessage({message: 'pointerup', x: e.pageX - window.scrollX, y: e.pageY - window.scrollY}, '*');
        }

        this.stopDrag();
    };

    private isInsideFrame(e: PointerEvent) {
        const x = e.pageX - window.scrollX;
        const y = e.pageY - window.scrollY;
        return x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight;
    }

    private documentPointerMove = (e: PointerEvent) => {
        const isInside = this.isInsideFrame(e);
        if (!this.pointerIsOut && !isInside) {
            this.startCanvasDrag();
        } else if (this.pointerIsOut && isInside) {
            //If the pointer has re-entered the iframe while dragging, tell the extension to
            //cancel the ongoing interaction for dragging the new block out.
            this.stopCanvasDrag();
        }
        this.pointerIsOut = !isInside;

        //While dragging the HTML element around, move it around
        //with relative positioning to keep it attached to the pointer cursor.
        const target = this.getTarget();

        if (this.pointerDownEvent && target) {
            target.style.position = 'relative';
            target.style.top = e.pageY - this.pointerDownEvent.pageY + 'px';
            target.style.left = e.pageX - this.pointerDownEvent.pageX + 'px';
        }

        if (isInside) {
            //Defense in depth: If somehow the pointer buttons have been released and the user
            //is moving the pointer over this iframe again, cancel any ongoing drag operation.
            if (e.buttons == 0) {
                this.stopDrag();
            }
        } else {
            //Notify the editor that it needs to simulate canvas pointer events
            parent.postMessage({message: 'pointermove', x: e.pageX - window.scrollX, y: e.pageY - window.scrollY}, '*');
        }
    };

    //If we have asked the extension to start a drag-new-block interaction, we need
    //to listen for a message indicating that interaction has completed (either
    //successfully or not) in order to reset our drag/drop state entirely.
    private windowMessage = (e: MessageEvent) => {
        if (e.data['message'] === 'dragDone') {
            this.stopDrag();
        }
    };

    private startCanvasDrag() {
        parent.postMessage(
            {
                message: 'drag',
                shape: this.dragShape,
                prompt: this.dragRemoteShape,
                branch: this.dragBranch,
                defaultModel: this.defaultModel,
            },
            '*',
        );
    }

    private stopCanvasDrag() {
        parent.postMessage({message: 'cancelDrag'}, '*');
    }

    //Start listening for pointer events on this iframe to implement drag & drop.
    private startDrag() {
        window.document.addEventListener('pointerup', this.documentPointerUp);
        window.document.addEventListener('pointermove', this.documentPointerMove);
    }

    //Cancel drag & drop, and reset the DOM back to how it began.
    private stopDrag() {
        const target = this.getTarget();
        if (target) {
            target.style.position = 'static';
            target.style.top = '';
            target.style.left = '';
            this.pointerDownEvent = undefined;
        }
        window.document.removeEventListener('pointerup', this.documentPointerUp);
        window.document.removeEventListener('pointermove', this.documentPointerMove);
        this.stopCanvasDrag();
    }

    public pointerDown(e: PointerEvent, shape: string, branch: string | undefined = undefined) {
        //Store the event that started the drag, as a coordinate anchor.
        this.pointerDownEvent = e;
        this.pointerIsOut = false;

        this.dragShape = shape;
        this.dragRemoteShape = undefined;
        this.dragBranch = undefined;

        this.startDrag();
    }
}
