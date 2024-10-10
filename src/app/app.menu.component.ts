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

    model: any[];
    resourcesList: IRolResourceDto[];

    constructor(public appMain: AppMainComponent,
        private resourceService: ResourceService
    ) {}

    ngOnInit() {
        this.getResources();
    }

    private getResources() {
        let resourceObservable = this.resourceService.getResources();

        forkJoin([resourceObservable]).subscribe(
            ([resources]) => {
                this.resourcesList = resources.data;
                //Armar el menú
                this.buildResourceMenu();
            }
        );
    }

    private buildResourceMenu() {
        this.model = [
            {label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard']},

            //Componentes ejemplos
            // {
            //     label: 'UI Kit', icon: 'pi pi-fw pi-star', routerLink: ['/uikit'],
            //     items: [
            //         {label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/dashboard/uikit/formlayout']},
            //         {label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/dashboard/uikit/input']},
            //         {label: 'Float Label', icon: 'pi pi-bookmark', routerLink: ['/dashboard/uikit/floatlabel']},
            //         {label: 'Invalid State', icon: 'pi pi-exclamation-circle', routerLink: ['/dashboard/uikit/invalidstate']},
            //         {label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/dashboard/uikit/button'], class: 'rotated-icon'},
            //         {label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/dashboard/uikit/table']},
            //         {label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/dashboard/uikit/list']},
            //         {label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/dashboard/uikit/tree']},
            //         {label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/dashboard/uikit/panel']},
            //         {label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/dashboard/uikit/overlay']},
            //         {label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/dashboard/uikit/media'], preventExact: true},
            //         {label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/dashboard/uikit/menu']},
            //         {label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/dashboard/uikit/message']},
            //         {label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/dashboard/uikit/file']},
            //         {label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard/uikit/charts']},
            //         {label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/dashboard/uikit/misc']}
            //     ]
            // },
        ];

        this.resourcesList.forEach(resource => {
            let menuItem = {
                label: resource.resourceName, 
                icon: resource.icon, 
                routerLink: resource.url, 
                items: [] 
            };

            //Armar hijos
            if (resource.childrenResources && resource.childrenResources.length > 0) {
                resource.childrenResources.forEach(child => {
                    menuItem.items.push({
                        label: child.resourceName, 
                        icon: child.icon, 
                        routerLink: child.url, 
                    });
                });
            }

            //Adicion al modelo de menu
            this.model.push(menuItem);

        });
    }
}



            // {
            //     label: 'Mega', icon: 'pi pi-fw pi-list', badge: 2, mega: true,
            //     items: [
            //         {
            //             label: 'UI Kit', icon: 'pi pi-fw pi-star', routerLink: ['/uikit'],
            //             items: [
            //                 {label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout']},
            //                 {label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input']},
            //                 {label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'], class: 'rotated-icon'},
            //                 {label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table']},
            //                 {label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list']},
            //                 {label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree']},
            //                 {label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel']},
            //                 {label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay']},
            //                 {label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media']},
            //                 {label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu']},
            //                 {label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message']},
            //                 {label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file']},
            //                 {label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts']},
            //                 {label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc']}
            //             ]
            //         },
            //         {
            //             label: 'Templates',
            //             items: [
            //                 {label: 'Ultima', icon: 'pi pi-desktop', url: 'https://www.primefaces.org/layouts/ultima-ng' },
            //                 {label: 'Serenity', icon: 'pi pi-desktop', url: 'https://www.primefaces.org/layouts/serenity-ng'},
            //                 {label: 'Avalon', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/avalon-ng'},
            //                 {label: 'Apollo', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/apollo-ng'},
            //                 {label: 'Roma', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/roma-ng'},
            //                 {label: 'Babylon', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/babylon-ng'},
            //                 {label: 'Manhattan', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/manhattan-ng'},
            //                 {label: 'Verona', icon: 'pi pi-desktop', url: 'https://www.primefaces.org/layouts/verona-ng'},
            //                 {label: 'Olympia', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/olympia-ng'},
            //                 {label: 'Ecuador', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/layouts/ecuador-ng'}
            //             ]
            //         },
            //         {
            //             label: 'Demo',
            //             items: [
            //                 {label: 'PrimeFaces', icon: 'pi pi-desktop', url: 'https://www.primefaces.org/showcase'},
            //                 {label: 'PrimeNG', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/primeng'},
            //                 {label: 'PrimeReact', icon: 'pi pi-desktop',  url: 'https://www.primefaces.org/primereact'}
            //             ]
            //         }
            //     ]
            // },
