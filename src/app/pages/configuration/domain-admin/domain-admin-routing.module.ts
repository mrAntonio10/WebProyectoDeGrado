import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DomainAdminComponent } from './domain-admin.component';

const routes: Routes = [{ path: '', component: DomainAdminComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DomainAdminRoutingModule { }
