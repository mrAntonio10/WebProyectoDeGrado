import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWarehouseComponent } from './create-warehouse.component';

describe('CreateWarehouseComponent', () => {
  let component: CreateWarehouseComponent;
  let fixture: ComponentFixture<CreateWarehouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateWarehouseComponent]
    });
    fixture = TestBed.createComponent(CreateWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
