import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ButtonComponent} from '@shared';
import {EndpointComponent} from '../endpointform/endpoint/endpoint.component';
import {PackageSettings} from '../packagesettings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less'],
    standalone: true,
    imports: [CommonModule, ButtonComponent, EndpointComponent],
})
export class SettingsComponent {
    protected phrases = {
        // TODO i18n
        zeroStateMessage: () =>
            this.packageSettings.canEdit
                ? 'Connect your model to execute prompts on the canvas'
                : 'Ask an account admin to connect a model to execute prompts on the canvas',
        connectModel: 'Connect model',
    };

    constructor(protected readonly packageSettings: PackageSettings) {}

    protected addNewEndpoint() {
        this.packageSettings.addNewEndpoint();
    }

    protected get isEditing() {
        return this.packageSettings.isEditing();
    }
}
