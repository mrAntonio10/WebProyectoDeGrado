import {Component, OnInit} from '@angular/core';
import {EventService} from '../service/eventservice';
import {Product} from '../domain/product';
import {ProductService} from '../service/productservice';
import {BreadcrumbService} from '../../app.breadcrumb.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ITotalCharInfo, ITotalCharProductInfo } from 'src/app/model/orderDetail/orderDetail';
import { forkJoin } from 'rxjs';
import { OrderDetailService } from 'src/app/services/orderDetail/order-detail.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';

@Component({
    templateUrl: './dashboard.component.html',
    providers: [MessageService, DatePipe]
})
export class DashboardComponent implements OnInit {

    enterpriseList: any = [];
    branchOfficeList: any = [];
    actualBranchOfficName: string;

    pieData: any;
    pieOptions: any;
    barData: any;
    barOptions: any;
    barProductData: any;

    charData: ITotalCharInfo[];
    charProductData: ITotalCharProductInfo[];
    totalQuantity: number = 0;
    totalPrices: number = 0;
    rgbColors = [
        'rgb(255, 205, 86)', //1 Amarillo claro
        'rgb(75, 192, 192)', //2 Verde agua
        'rgb(255, 195, 0)',  //3 Amarillo pastel
        'rgb(76, 245, 56)',  //4 Verde lima claro
        'rgb(81, 252, 244)', //5 Celeste claro
        'rgb(203, 81, 252)', //6 Morado claro
        'rgb(255, 182, 193)', //7 Rosa pastel
        'rgb(255, 223, 186)', //8 Durazno claro
        'rgb(173, 216, 230)', //9 Azul pastel
        'rgb(144, 238, 144)', //10 Verde claro
        'rgb(255, 240, 245)', //11 Lavanda claro
        'rgb(221, 160, 221)', //12 Orquídea pastel
        'rgb(230, 230, 250)', //13 Lavanda
        'rgb(250, 235, 215)', //14 Antiguo blanco
        'rgb(240, 255, 240)', //15 Menta suave
        'rgb(250, 250, 210)', //16 Amarillo claro pastel
        'rgb(255, 239, 213)', //17 Durazno pastel
        'rgb(245, 222, 179)', //18 Trigo suave
        'rgb(255, 228, 225)', //19 Rosa niebla
        'rgb(255, 250, 205)'  //20 Amarillo suave
    ];

    formGroup: FormGroup;
    date: Date = new Date;
    datestring: string;

    products: Product[];

    cols: any[];

    chartData: any;

    chartOptions: any;

    selectedTask: string[] = [];

    constructor(private productService: ProductService, 
        private eventService: EventService, 
        private breadcrumbService: BreadcrumbService,
        private service: MessageService,
        private orderDetailService: OrderDetailService,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private primengConfig: PrimeNGConfig,
        private enterpriseService: EnterpriseService,
        private branchOfficeService: BranchOfficeService
    ) {
        this.breadcrumbService.setItems([
            {label: 'Dashboard'}
        ]);
    }

    ngOnInit() {
        let user = localStorage.getItem('user');
        this.datestring = this.datePipe.transform(this.date, 'dd/MM/yyyy');

        this.getEnterpriseCombo();

        this.primengConfig.setTranslation({
            dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
            dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
            dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
            monthNames: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
            monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
            today: 'Hoy',
            clear: 'Borrar',
            dateFormat: 'dd-MM-yy',
          });

        this.formGroup = this.buildForm();
        this.getCharInfoData();
    }

    private getEnterpriseCombo() {
        let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();
    
        forkJoin([observableEnterpriseList]).subscribe({
          next:  ([enterprises]) => {
            this.enterpriseList = enterprises.data;
          },
          complete: () => {
            if(this.enterpriseList.length == 1 ) {
              this.formGroup.get('idEnterprise').setValue(this.enterpriseList[0].id);
    
              let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(this.formGroup.value.idEnterprise);
    
              forkJoin([observableBranchOfficeList]).subscribe(
                ([branchOffices]) => {
                  this.branchOfficeList = branchOffices.data;

                  this.getCharProductInfoData(this.branchOfficeList[0].id);
                }
              );
            } else {
              this.enterpriseList.unshift({name: 'Todas las empresas', id: '-', state: ''});
            }
          }
        });
      }
    
      getBranchOfficeCombo(event) {
        let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(event.value);
    
        forkJoin([observableBranchOfficeList]).subscribe(
          ([branchOffices]) => {
            this.branchOfficeList = branchOffices.data ?? [];
            if(this.branchOfficeList.length == 0) {
              this.branchOfficeList.unshift({name: 'Todas las sucursales', id: '', state: ''});
            }
          }
        );
      }
    

    buildForm(): FormGroup {
        const group = this.fb.group({});
    
          group.addControl('date', this.fb.control((this.date)));
          group.addControl('idEnterprise', this.fb.control(''));
          group.addControl('idBranchOffice', this.fb.control(''));
    
          return group;
      }

    submitForm() {
        if (this.formGroup.valid) {
            this.date = this.formGroup.value.date;
            
            this.datestring = this.datePipe.transform(this.formGroup.value.date, 'dd/MM/yyyy');

            this.getCharInfoData(this.datestring);

            let idBranchOffice = this.formGroup.value.idBranchOffice;
            this.getCharProductInfoData(idBranchOffice, this.datestring);
        }
    } 

    private getCharProductInfoData(idBranch, dateValue: String = '') {
        let charInfoDataObservable = this.orderDetailService.getCharProductInfoData({idBranchOffice: idBranch, date: dateValue});

        forkJoin([charInfoDataObservable]).subscribe({
            next:([data]) => {
                this.charProductData = data.data ?? [];
                console.log("JAHDGAJSDJDA", this.charProductData);

            },
            complete: () => {
                this.actualBranchOfficName = this.charProductData[0].branchOfficeName ?? '';

                var labels = [];
                var values = [];
             
                this.charProductData.forEach((data) => {
                    labels.push(data.productName);
                    values.push(data.totalQuantity);
                });
                this.buildProductsBarData(labels, values);
            }
        });
    }

    private getCharInfoData(dateValue: String = '') {
        let charInfoDataObservable = this.orderDetailService.getCharInfoData({date: dateValue});

        forkJoin([charInfoDataObservable]).subscribe({
            next:([data]) => {
                this.charData = data.data ?? [];
            },
            complete: () => {
                var labels = [];
                var values = [];
                var pricesValues = [];

                this.totalQuantity = 0;
                this.totalPrices = 0;

                this.charData.forEach((data) => {
                    labels.push(data.branchOfficeName);
                    values.push(data.totalQuantity);
                    pricesValues.push(data.totalPrice);

                    this.totalQuantity = this.totalQuantity + data.totalQuantity;
                    this.totalPrices = this.totalPrices + data.totalPrice;
                });

                this.buildDoughnut(labels, values);
                this.buildPricesBarData(labels, pricesValues);
            }
        });
    }

    private buildDoughnut(labelsData, valuesData) {
        this.pieData = {
            labels: labelsData,
            datasets: [
                {
                    data: valuesData,
                    backgroundColor: this.rgbColors
                }]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: '#A0A7B5'
                    }
                }
            }
        };
    }

    private buildPricesBarData(labelsData, pricesData) {
        var dataSet = [];
        var index = 0;
        var indexColor = 0;

        labelsData.forEach( (label) => {
            dataSet.push({
                label: label,
                backgroundColor: this.rgbColors[indexColor],
                borderColor: 'rgb(255, 99, 132)',
                data: [pricesData[index]]
            });

            index++;
            if(indexColor >20) {
                indexColor = 0;
            } else {
                indexColor++;
            }
        });

        
        this.barData = {
            labels: ['Total ganancias Bs.'],
            datasets: dataSet
        };

        this.barOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: '#A0A7B5'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#A0A7B5'
                    },
                    grid: {
                        color:  'rgba(160, 167, 181, .3)',
                    }
                },
                y: {
                    ticks: {
                        color: '#A0A7B5'
                    },
                    grid: {
                        color:  'rgba(160, 167, 181, .3)',
                    }
                },
            }
        };
    }

    private buildProductsBarData(labelsData, pricesData) {
        var dataSet = [];
        var index = 0;
        var indexColor = 0;

        labelsData.forEach( (label) => {
            dataSet.push({
                label: label,
                backgroundColor: this.rgbColors[indexColor],
                borderColor: 'rgb(255, 99, 132)',
                data: [pricesData[index]]
            });

            index++;
            if(indexColor >20) {
                indexColor = 0;
            } else {
                indexColor++;
            }
        });

        
        this.barProductData = {
            labels: ['Total unidades vendidas.'],
            datasets: dataSet
        };

    }
}
