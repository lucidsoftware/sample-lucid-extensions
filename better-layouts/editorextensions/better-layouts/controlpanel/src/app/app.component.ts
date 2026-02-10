import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {SliderWithToggleComponent} from './slider-with-toggle/slider-with-toggle.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {bootstrapTriangle, bootstrapCircle, bootstrapArrowClockwise, bootstrapArrowCounterclockwise} from '@ng-icons/bootstrap-icons';
import {SpiralRadiusSliderConfiguration, SpiralSpacingSliderConfiguration} from '../../../src/layouts/spiral/spiralpanelconfiguration';
import {CircleRadiusSliderConfiguration} from '../../../src/layouts/circle/circlepanelconfiguration';
import {TriangleSideLengthSliderConfiguration} from '../../../src/layouts/triangle/trianglepanelconfiguration';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SliderWithToggleComponent,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      bootstrapTriangle,
      bootstrapCircle,
      bootstrapArrowClockwise,
      bootstrapArrowCounterclockwise
    }),
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'controlpanel';

  public shapeType: string = 'circle';
  public radius: number | undefined = undefined;
  public sideLength: number | undefined = undefined;
  public spacing: number | undefined = undefined;
  public clockwise: boolean | undefined = undefined;

  getRadiusSliderConfiguration() {
    if(this.shapeType === 'spiral') {
      return SpiralRadiusSliderConfiguration;
    } else {
      return CircleRadiusSliderConfiguration;
    }
  }

  setRadius(value?: number) {
    this.radius = value;
    this.sendToParent();
  }

  setSideLength(value?: number) {
    this.sideLength = value;
    this.sendToParent();
  }

  setSpacing(value?: number) {
    this.spacing = value;
    this.sendToParent();
  }

  setClockwise(value: boolean) {
    this.clockwise = value;
    this.sendToParent();
  }

  setShapeType(type: string) {
    this.shapeType = type;
    this.setToDefaults();
    this.sendToParent();
  }

  private setToDefaults() {
    this.radius = undefined;
    this.sideLength = undefined;
    this.spacing = undefined;
    this.clockwise = undefined;
  }

  private sendToParent() {
    parent.postMessage({
      type: this.shapeType,
      radius: this.radius,
      sideLength: this.sideLength,
      spacing: this.spacing,
      clockwise: this.clockwise
    }, '*');
  }

  protected readonly TriangleSideLengthSliderConfiguration = TriangleSideLengthSliderConfiguration;
  protected readonly SpiralSpacingSliderConfiguration = SpiralSpacingSliderConfiguration;
}
