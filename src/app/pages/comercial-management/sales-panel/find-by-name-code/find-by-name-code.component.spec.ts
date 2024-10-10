import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindByNameCodeComponent } from './find-by-name-code.component';

describe('FindByNameCodeComponent', () => {
  let component: FindByNameCodeComponent;
  let fixture: ComponentFixture<FindByNameCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FindByNameCodeComponent]
    });
    fixture = TestBed.createComponent(FindByNameCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
