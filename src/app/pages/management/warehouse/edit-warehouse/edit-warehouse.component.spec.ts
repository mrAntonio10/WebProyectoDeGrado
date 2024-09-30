import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWarehouseComponent } from './edit-warehouse.component';

describe('EditWarehouseComponent', () => {
  let component: EditWarehouseComponent;
  let fixture: ComponentFixture<EditWarehouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditWarehouseComponent]
    });
    fixture = TestBed.createComponent(EditWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
