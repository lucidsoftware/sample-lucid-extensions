import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-shape',
    templateUrl: './shape.component.html',
    styleUrls: ['./shape.component.less'],
    standalone: true,
})
export class ShapeComponent {
    @Input({required: true}) shapeTitle!: string;
    @Input({required: true}) shapeIcon!: string;
}
