import {Component, OnInit} from '@angular/core';
import {EventService} from '../service/eventservice';
import {Product} from '../domain/product';
import {ProductService} from '../service/productservice';
import {BreadcrumbService} from '../../app.breadcrumb.service';
import { MessageService } from 'primeng/api';

@Component({
    templateUrl: './dashboard.component.html',
    providers: [MessageService]
})
export class DashboardComponent implements OnInit {

    products: Product[];

    cols: any[];

    chartData: any;

    chartOptions: any;

    selectedTask: string[] = [];

    constructor(private productService: ProductService, 
        private eventService: EventService, 
        private breadcrumbService: BreadcrumbService,
        private service: MessageService,
    ) {
        this.breadcrumbService.setItems([
            {label: 'Dashboard'}
        ]);
    }

    ngOnInit() {
        let user = localStorage.getItem('user');
        console.log("Mensajeee", user);

        this.service.add({ severity: 'success', summary: 'Bienvenido', detail: user });
    }
}
