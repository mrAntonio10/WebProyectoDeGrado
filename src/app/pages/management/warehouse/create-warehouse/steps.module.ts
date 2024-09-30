import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CreateWarehouseComponent } from './create-warehouse.component';
import { PersonalComponent } from 'src/app/demo/view/menus/personal.component';
import { ConfirmationComponent } from 'src/app/demo/view/menus/confirmation.component';
import { SeatComponent } from 'src/app/demo/view/menus/seat.component';


@NgModule({
  declarations: [
    CreateWarehouseComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {path:'',component: CreateWarehouseComponent, children:[
				{path:'', redirectTo: 'personal', pathMatch: 'full'},
				{path: 'personal', component: PersonalComponent},
				{path: 'seat', component: SeatComponent},
        ]}
    ])
  ],
  exports: [RouterModule]
})
export class StepsModule { }
