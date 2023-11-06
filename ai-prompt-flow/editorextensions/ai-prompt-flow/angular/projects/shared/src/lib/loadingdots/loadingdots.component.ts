import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
@Component({
    selector: 'loading-dots',
    templateUrl: './loadingdots.component.html',
    styleUrls: ['./loadingdots.component.less'],
    standalone: true,
    imports: [CommonModule],
})
export class LoadingDotsComponent {
    @Input() public radius = 2;
}
