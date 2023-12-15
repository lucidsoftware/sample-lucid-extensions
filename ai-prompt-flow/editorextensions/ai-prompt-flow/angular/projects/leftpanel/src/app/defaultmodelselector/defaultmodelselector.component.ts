import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {PackageSettings} from '../packagesettings.service';

@Component({
    selector: 'app-default-model-selector',
    standalone: true,
    templateUrl: './defaultmodelselector.component.html',
    imports: [CommonModule, FormsModule],
    styleUrls: ['./defaultmodelselector.component.less'],
})
export class DefaultModelSelectorComponent {
    protected phrases = {
        // TODO i18n
        defaultModel: 'Default model',
        none: 'none',
    };

    constructor(protected readonly packageSettings: PackageSettings) {}

    ngOnInit() {
        // Each time we load this, double check that the selected model still exists. If not, set to
        // the first model.
        this.packageSettings.runWhenLoaded(() => {
            this.verifyDefaultModelExists();
        });
    }
    public verifyDefaultModelExists() {
        if (
            this.defaultModel == '' ||
            !this.packageSettings.officialEndpoints.map((e) => e['display-name']).includes(this.defaultModel)
        ) {
            this.defaultModel = this.packageSettings.officialEndpoints[0]?.['display-name'] ?? '';
        }
    }

    // Storing the default model in localStorage allows each user to save their own default while
    // still allowing persistent values.
    protected get defaultModel(): string {
        return localStorage.getItem('defaultModel') ?? '';
    }
    protected set defaultModel(defaultModel: string) {
        localStorage.setItem('defaultModel', defaultModel);
    }

    protected getDefaultModelOptions(): string[] {
        return this.packageSettings.officialEndpoints.map((e) => e['display-name']);
    }
}
