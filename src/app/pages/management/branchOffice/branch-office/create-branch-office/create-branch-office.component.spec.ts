import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBranchOfficeComponent } from './create-branch-office.component';

describe('CreateBranchOfficeComponent', () => {
  let component: CreateBranchOfficeComponent;
  let fixture: ComponentFixture<CreateBranchOfficeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateBranchOfficeComponent]
    });
    fixture = TestBed.createComponent(CreateBranchOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
