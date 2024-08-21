import {Component, OnInit} from '@angular/core';
import {EventService} from '../service/eventservice';
import {Product} from '../domain/product';
import {ProductService} from '../service/productservice';
import {BreadcrumbService} from '../../app.breadcrumb.service';

@Component({
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

    products: Product[];

    cols: any[];

    chartData: any;

    chartOptions: any;

    selectedTask: string[] = [];

    constructor(private productService: ProductService, private eventService: EventService, private breadcrumbService: BreadcrumbService) {
        this.breadcrumbService.setItems([
            {label: 'Dashboard'}
        ]);
    }

    ngOnInit() {
        this.productService.getProducts().then(data => this.products = data);

        this.chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Sales',
                    data: [12, 19, 3, 5, 2, 3, 9],
                    borderColor: [
                        '#4CAF50',
                    ],
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 3,
                    tension: .4
                },
                {
                    label: 'Income',
                    data: [1, 2, 5, 3, 12, 7, 15],
                    backgroundColor: [
                        'rgba(187,222,251,0.2)',
                    ],
                    borderColor: [
                        '#00BCD4',
                    ],
                    borderWidth: 3,
                    fill: true,
                    tension: .4
                },
                {
                    label: 'Expenses',
                    data: [7, 12, 15, 5, 3, 13, 21],
                    borderColor: [
                        '#e91e63',
                    ],
                    borderWidth: 3,
                    fill: false,
                    pointRadius: [4, 6, 4, 12, 8, 0, 4],
                    tension: .4
                },
                {
                    label: 'New Users',
                    data: [3, 7, 2, 17, 15, 13, 19],
                    borderColor: [
                        '#FF8F00',
                    ],
                    borderWidth: 3,
                    fill: false,
                    tension: .4
                }]
        };

        this.chartOptions = {
            responsive: true,
            hover: {
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }
            }
        };
    }
}
