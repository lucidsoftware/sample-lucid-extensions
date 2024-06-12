import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderWithToggleComponent } from './slider-with-toggle.component';

describe('SliderWithToggleComponent', () => {
  let component: SliderWithToggleComponent;
  let fixture: ComponentFixture<SliderWithToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderWithToggleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderWithToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
