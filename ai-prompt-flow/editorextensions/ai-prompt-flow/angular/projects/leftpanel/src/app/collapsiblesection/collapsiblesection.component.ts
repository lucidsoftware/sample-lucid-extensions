import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-collapsible-section',
    templateUrl: './collapsiblesection.component.html',
    standalone: true,
    imports: [CommonModule],
    styleUrls: ['./collapsiblesection.component.less'],
})
export class CollapsibleSectionComponent {
    @Input() sectionTitle: string = '';
    isCollapsed: boolean = false;

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }
}
