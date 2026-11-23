import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { ResourceService } from './services/resource/resource.service';
import { IRolResourceDto } from './model/resource/resource';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    resourcesList: IRolResourceDto[] = [];

    constructor(
        public appMain: AppMainComponent,
        private resourceService: ResourceService
    ) {}

    ngOnInit() {
        const token = localStorage.getItem('token');
        if (!token) {
            // Modo comprador público Rekids (Sin Login)
            this.buildPublicBuyerMenu();
            return;
        }
        this.getResources();
    }

    private buildPublicBuyerMenu() {
        this.model = [
            {
                label: 'Tienda Online Rekids (Punto de Venta)',
                icon: 'pi pi-shopping-cart',
                routerLink: ['/dashboard/comercial-management/sales-panel']
            },
            {
                label: 'Acceso Administrador',
                icon: 'pi pi-lock',
                routerLink: ['/home']
            }
        ];
    }

    private getResources() {
        const resourceObservable = this.resourceService.getResources();

        forkJoin([resourceObservable]).subscribe({
            next: ([resources]) => {
                this.resourcesList = resources.data || [];
            },
            error: () => {
                this.buildDefaultAdminMenu();
            },
            complete: () => {
                this.buildResourceMenu();
            }
        });
    }

    private buildDefaultAdminMenu() {
        this.model = [
            {
                label: 'Portal Admin Rekids',
                icon: 'pi pi-fw pi-calendar-plus',
                routerLink: ['/dashboard/management/events'],
                items: [
                    {
                        label: 'Eventos, Descuentos y Sincronización',
                        icon: 'pi pi-fw pi-calendar-plus',
                        routerLink: ['/dashboard/management/events']
                    },
                    {
                        label: 'Punto de Venta Online (Vista Comprador)',
                        icon: 'pi pi-fw pi-shopping-cart',
                        routerLink: ['/dashboard/comercial-management/sales-panel']
                    }
                ]
            }
        ];
    }

    private buildResourceMenu() {
        this.model = [
            {
                label: 'Eventos Rekids (Admin)',
                icon: 'pi pi-calendar-plus',
                routerLink: ['/dashboard/management/events']
            },
            {
                label: 'Tienda Online Rekids',
                icon: 'pi pi-shopping-cart',
                routerLink: ['/dashboard/comercial-management/sales-panel']
            }
        ];

        this.resourcesList.forEach(resource => {
            const menuItem = {
                label: resource.resourceName,
                icon: resource.icon,
                routerLink: resource.url,
                expanded: false,
                items: []
            };

            if (resource.childrenResources && resource.childrenResources.length > 0) {
                resource.childrenResources.forEach(child => {
                    menuItem.items.push({
                        label: child.resourceName,
                        icon: child.icon,
                        routerLink: child.url,
                        expanded: false
                    });
                });
            }

            this.model.push(menuItem);
        });
    }

    onMenuItemClick(item: any) {
        if (item.routerLink) {
            localStorage.setItem('openResource', item.routerLink);
        }
    }
}
