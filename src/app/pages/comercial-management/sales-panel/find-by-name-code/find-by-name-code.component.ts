import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-find-by-name-code',
  templateUrl: './find-by-name-code.component.html',
  styleUrls: ['./find-by-name-code.component.scss']
})
export class FindByNameCodeComponent implements OnInit {
  formGroup: FormGroup;
  
  constructor(private fb: FormBuilder,
    private ref: DynamicDialogRef
  ){}

  ngOnInit(): void {
    this.formGroup = this.buildForm();
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('filter', this.fb.control((''), [Validators.required]));

    return group;
  }

  submitForm() {
    this.ref.close(this.formGroup.value.filter);
  }
}
