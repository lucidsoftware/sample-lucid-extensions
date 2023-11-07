import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {EditableEndpoint} from '../../packagesettings.service';
import {EditEndpointComponent} from '../editendpoint/editendpoint.component';
import {ExistingEndpointComponent} from '../existingendpoint/existingendpoint.component';

@Component({
    selector: 'app-endpoint',
    templateUrl: './endpoint.component.html',
    styleUrls: ['./endpoint.component.less'],
    imports: [CommonModule, EditEndpointComponent, ExistingEndpointComponent],
    standalone: true,
})
export class EndpointComponent {
    @Input({required: true}) public endpoint!: EditableEndpoint;
}
