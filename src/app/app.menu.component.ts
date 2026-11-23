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
            // Modo comprador público Rekids (Solo rutas de cliente, sin acceso/link a login admin)
            this.buildPublicBuyerMenu();
            return;
        }
        this.getResources();
    }

    private buildPublicBuyerMenu() {
        this.model = [
            {
                label: 'Quiénes Somos',
                icon: 'pi pi-fw pi-heart',
                routerLink: ['/dashboard/comercial-management/about-us']
            },
            {
                label: 'Tienda Online RE KIDS',
                icon: 'pi pi-fw pi-shopping-cart',
                routerLink: ['/dashboard/comercial-management/sales-panel']
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
                label: 'Navegación RE KIDS',
                icon: 'pi pi-fw pi-compass',
                items: [
                    {
                        label: 'Quiénes Somos',
                        icon: 'pi pi-fw pi-heart',
                        routerLink: ['/dashboard/comercial-management/about-us']
                    },
                    {
                        label: 'Tienda Online RE KIDS',
                        icon: 'pi pi-fw pi-shopping-cart',
                        routerLink: ['/dashboard/comercial-management/sales-panel']
                    },
                    {
                        label: 'Eventos, Descuentos y Sincronización',
                        icon: 'pi pi-fw pi-calendar-plus',
                        routerLink: ['/dashboard/management/events']
                    }
                ]
            }
        ];
    }

    private buildResourceMenu() {
        this.model = [
            {
                label: 'Quiénes Somos',
                icon: 'pi pi-fw pi-heart',
                routerLink: ['/dashboard/comercial-management/about-us']
            },
            {
                label: 'Tienda Online RE KIDS',
                icon: 'pi pi-fw pi-shopping-cart',
                routerLink: ['/dashboard/comercial-management/sales-panel']
            },
            {
                label: 'Eventos Rekids',
                icon: 'pi pi-fw pi-calendar-plus',
                routerLink: ['/dashboard/management/events']
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
            this.appMain.menuActive = false;
            this.appMain.unblockBodyScroll();
        }
    }
}
