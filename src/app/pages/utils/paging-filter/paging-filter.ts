import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Input, Output, EventEmitter, SimpleChanges, OnDestroy  } from '@angular/core';
import { CustomerService } from 'src/app/demo/service/customerservice';
import { ProductService } from 'src/app/demo/service/productservice';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api'
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ColumnStructure } from 'src/app/demo/domain/columnDataStructure';
import { Router } from '@angular/router';

import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'paging-filter',
    templateUrl: './paging-filter.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [`
        :host ::ng-deep  .p-frozen-column {
            font-weight: bold;
        }

        :host ::ng-deep .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        :host ::ng-deep .p-progressbar {
            height:.5rem;
        }
    `]
})
export class PagingFilterComponent implements OnInit {

    @Input() title: string = 'xddd';
    @Input() globalFilters: string[];
    @Input() principalLabel: string;
    @Input() sucessorLabel: string;
    @Input() data: any;
    @Input() dataStructure: ColumnStructure[];

    @Output() pageChangeTriggered = new EventEmitter<any>();

    @Input() buildCreateForm: any;
    @Input() createVisible: boolean;
    @Input() actions: any;

    @Output() actionTriggered = new EventEmitter<{ action: string, data: any }>();

    value: any;
    totalRecords: number;
    rows: number;

    loading:boolean = false;
    isInitialLoad: boolean = true;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    constructor(
        private customerService: CustomerService, 
        private productService: ProductService, 
        public breadcrumbService: BreadcrumbService, 
        private messageService: MessageService, 
        private confirmService: ConfirmationService, 
        private cd: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute
        ) {
    }

    ngOnInit() {
        this.buildData();
        
        this.breadcrumbService.setItems([
            {label: this.principalLabel},  //Parent
            {label: this.sucessorLabel}    //Resource-CHILD
        ]);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data && !changes.data.isFirstChange()) {
            this.loading = false; 
            this.buildData();  
        }
    }

    clear() {
        const lazyLoadEvent: LazyLoadEvent = {
            first: 0,
            rows: this.rows,
            sortField: null,
            sortOrder: null,
            filters: {}
        };
        
        this.loadData(lazyLoadEvent);
    }

    buildData() {
        this.value = this.data.content;
        this.totalRecords = this.data.page.totalElements;
        this.rows = this.data.page.size;
    }

    loadData(event: any) {
        if(!!event && !this.isInitialLoad) {
            this.pageChangeTriggered.emit({
                first: event.first,
                rows: event.rows,
                page: event.first / event.rows,
                filters: event.filters,
              });
        } else {
            this.isInitialLoad = false;
        }
      }


    protected get visibleColumns() {
        return this.dataStructure.filter(column => column.visible);
    }

    navigateToCreate() {
        this.activatedRoute.url.subscribe(urlSegments => {
            const fullPath = urlSegments.map(segment => segment.path).join('/');
            sessionStorage.setItem('fullPath', fullPath);

            localStorage.setItem('dinamicFormConfig', JSON.stringify({...this.buildCreateForm, action: 'create'}));

            this.router.navigate([`/dashboard/${fullPath}/create`]);
          });
    }

    handleAction(action: string, data: any) {
        this.actionTriggered.emit({ action, data });
      }

}

