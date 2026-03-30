import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DomainAdminRoutingModule } from './domain-admin-routing.module';
import { DomainAdminComponent } from './domain-admin.component';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    DomainAdminComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DomainAdminRoutingModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    ToolbarModule,
    ToastModule
  ]
})
export class DomainAdminModule { }
