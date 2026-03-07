import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgileAddProductComponent } from './agile-add-product.component';

describe('AgileAddProductComponent', () => {
  let component: AgileAddProductComponent;
  let fixture: ComponentFixture<AgileAddProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgileAddProductComponent]
    });
    fixture = TestBed.createComponent(AgileAddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
