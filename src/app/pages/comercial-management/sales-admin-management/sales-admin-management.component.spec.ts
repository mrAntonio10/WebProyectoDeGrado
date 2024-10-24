import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAdminManagementComponent } from './sales-admin-management.component';

describe('SalesAdminManagementComponent', () => {
  let component: SalesAdminManagementComponent;
  let fixture: ComponentFixture<SalesAdminManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesAdminManagementComponent]
    });
    fixture = TestBed.createComponent(SalesAdminManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
