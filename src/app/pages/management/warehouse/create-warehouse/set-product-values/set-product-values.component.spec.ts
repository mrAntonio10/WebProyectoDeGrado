import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetProductValuesComponent } from './set-product-values.component';

describe('SetProductValuesComponent', () => {
  let component: SetProductValuesComponent;
  let fixture: ComponentFixture<SetProductValuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetProductValuesComponent]
    });
    fixture = TestBed.createComponent(SetProductValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
