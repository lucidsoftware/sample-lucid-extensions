import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-slider-with-toggle',
  standalone: true,
  imports: [],
  templateUrl: './slider-with-toggle.component.html',
  styleUrl: './slider-with-toggle.component.css'
})
export class SliderWithToggleComponent {

  @Input() checked: boolean = true;
  @Input() min: number = 0;
  @Input() max: number = 10000;
  @Input() step: number = 1;
  public currentValue: number = 0;

  @Output() public valueChanged: EventEmitter<number> = new EventEmitter<number>();
  @Output() public toggleChanged: EventEmitter<number|undefined> = new EventEmitter<number|undefined>();

  public toggle() {
    this.checked = !this.checked;
    this.toggleChanged.emit(this.checked ? undefined : this.currentValue);
  }

  public setValue(event: any) {
    const maybeNumber = Number(event.target.value);
    if (isNaN(maybeNumber)) {
      return;
    }

    this.currentValue = maybeNumber
    this.valueChanged.emit(this.currentValue);
  }
}
