import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {EditableEndpoint, PackageSettings} from '../../packagesettings.service';

@Component({
    selector: 'app-existing-endpoint',
    templateUrl: './existingendpoint.component.html',
    styleUrls: ['./existingendpoint.component.less'],
    imports: [CommonModule],
    standalone: true,
})
export class ExistingEndpointComponent {
    @Input({required: true}) public endpoint!: EditableEndpoint;

    constructor(protected readonly packageSettings: PackageSettings) {}

    protected getModel(): boolean | string {
        if (this.endpoint['service-type'] == 'OpenAI') {
            return this.endpoint['model'];
        }
        return false;
    }

    protected onEdit() {
        this.endpoint.editing = true;
    }
}
