import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CreateWarehouseComponent } from './create-warehouse.component';
import { PersonalComponent } from 'src/app/demo/view/menus/personal.component';
import { SeatComponent } from 'src/app/demo/view/menus/seat.component';
import { SetProductValuesComponent } from './set-product-values/set-product-values.component';
import { SelectProductComponent } from './select-product/select-product.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {path:'',component: CreateWarehouseComponent, children:[
				{path:'', redirectTo: 'product', pathMatch: 'full'},
				{path: 'product', component: SelectProductComponent},
				{path: 'value', component: SetProductValuesComponent},
        ]}
    ])
  ],
  exports: [RouterModule]
})
export class StepsModule { }
