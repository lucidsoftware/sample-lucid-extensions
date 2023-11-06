import {CommonModule} from '@angular/common';
import {Component, Input, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {isAiEndpointServiceType} from '@extension/aiendpointconfiguration/aiendpointconfiguration';
import {ButtonComponent} from '@shared';
import {EditableEndpoint, PackageSettings} from '../../packagesettings.service';
import {NoDuplicateNamesValidator} from './noduplicatenames.directive';
import {NoWhitespaceValidator} from './nowhitespace.directive';

@Component({
    selector: 'app-edit-endpoint',
    templateUrl: './editendpoint.component.html',
    styleUrls: ['./editendpoint.component.less'],
    imports: [FormsModule, CommonModule, NoWhitespaceValidator, ButtonComponent, NoDuplicateNamesValidator],
    standalone: true,
})
export class EditEndpointComponent {
    @Input({required: true}) public endpoint!: EditableEndpoint;
    @ViewChild('form') form!: NgForm;

    protected phrases = {
        // TODO i18n
        save: 'Save',
        cancel: 'Cancel',
    };

    constructor(private readonly packageSettings: PackageSettings) {}

    protected onServiceTypeChange(event: Event) {
        const target = event.target;
        if (target instanceof HTMLSelectElement && isAiEndpointServiceType(target.value)) {
            this.endpoint['service-type'] = target.value;
        } else {
            console.error(`Invalid event received when trying to switch serviceType: ${event}`);
        }
    }

    protected onSubmit() {
        // Double check all fields before allowing submission.
        // Without this, you can create duplicate model names by
        // 1. Create two new models with the same name without saving.
        // 2. Neither is marked as invalid because we only check against the names of saved models.
        // 3. Save one model - no duplicates yet.
        // 4. Save the second model - this is a duplicate but allowed because when validation first ran,
        //    there was no saved model with the same name.
        for (const validator of Object.values(this.form.controls)) {
            validator.markAsTouched;
            validator.updateValueAndValidity();
        }
        if (this.form.valid) {
            this.packageSettings.saveEndpoint(this.endpoint);
        } else {
            this.form.control.markAllAsTouched();
        }
    }

    protected onDelete() {
        this.packageSettings.deleteEndpoint(this.endpoint);
    }

    protected onCancel() {
        this.packageSettings.resetEndpoint(this.endpoint);
    }

    public getSampleUrl() {
        if (this.endpoint['service-type'] == 'OpenAI') {
            return 'https://api.openai.com/v1/chat/completions';
        } else {
            return 'https://test.openai.azure.com/openai/deployments/deploy/staging-model/chat/completions?api_version=2023-06-12';
        }
    }
}
