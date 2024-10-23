import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDocumentInfoComponent } from './sales-document-info.component';

describe('SalesDocumentInfoComponent', () => {
  let component: SalesDocumentInfoComponent;
  let fixture: ComponentFixture<SalesDocumentInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesDocumentInfoComponent]
    });
    fixture = TestBed.createComponent(SalesDocumentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
