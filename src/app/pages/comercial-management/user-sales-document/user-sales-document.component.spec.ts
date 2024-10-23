import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSalesDocumentComponent } from './user-sales-document.component';

describe('UserSalesDocumentComponent', () => {
  let component: UserSalesDocumentComponent;
  let fixture: ComponentFixture<UserSalesDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSalesDocumentComponent]
    });
    fixture = TestBed.createComponent(UserSalesDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
