import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {ReadonlyAiEndpointConfiguration} from '@extension/aiendpointconfiguration/aiendpointconfiguration';
import {EditableEndpoint, PackageSettings} from '../../packagesettings.service';

@Directive({
    selector: '[noDuplicateNames]',
    providers: [{provide: NG_VALIDATORS, useExisting: NoDuplicateNamesValidator, multi: true}],
    standalone: true,
})
export class NoDuplicateNamesValidator implements Validator {
    @Input({required: true}) endpoint!: EditableEndpoint;
    constructor(private readonly packageSettings: PackageSettings) {}
    validate(control: AbstractControl): {[key: string]: any} | null {
        const modelName = control.value || '';
        let otherEndpoints: ReadonlyAiEndpointConfiguration[];
        if (this.endpoint.originalIndex == -1) {
            otherEndpoints = [...this.packageSettings.officialEndpoints];
        } else {
            otherEndpoints = [
                ...this.packageSettings.officialEndpoints.slice(0, this.endpoint.originalIndex),
                ...this.packageSettings.officialEndpoints.slice(this.endpoint.originalIndex + 1),
            ];
        }
        const isDuplicate = otherEndpoints.map((e) => e['display-name']).includes(modelName);
        return isDuplicate ? {'duplicateName': true} : null;
    }
}
