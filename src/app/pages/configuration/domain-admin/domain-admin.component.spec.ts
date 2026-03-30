import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainAdminComponent } from './domain-admin.component';

describe('DomainAdminComponent', () => {
  let component: DomainAdminComponent;
  let fixture: ComponentFixture<DomainAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DomainAdminComponent]
    });
    fixture = TestBed.createComponent(DomainAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
