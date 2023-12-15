import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    standalone: true,
    imports: [CommonModule],
    styleUrls: ['./tabs.component.less'],
})
export class TabsComponent {
    @Input() tabs: Tab[] = [];
    @Input() activeTabId: string = '';
    @Output() activeTabIdChange = new EventEmitter<string>();

    activateTab(tabId: string) {
        this.activeTabId = tabId;
        this.activeTabIdChange.emit(tabId);
    }
}

export interface Tab {
    displayName: string;
    id: string;
}
