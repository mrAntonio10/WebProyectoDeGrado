import { Component } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { LoginService } from './services/login/home.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    constructor(
        public app: AppMainComponent,
        private userService: LoginService,
        private router: Router
    ) {}

    /**
     * En el portal de comprador (sales-panel / tienda online) o cuando no hay sesión de Admin,
     * ocultamos el menú hamburguesa para que el cliente tenga una experiencia limpia de tienda web.
     */
    get showHamburgerMenu(): boolean {
        const hasAdminToken = !!localStorage.getItem('token');
        const currentUrl = this.router.url || '';
        const isBuyerPortal = currentUrl.includes('/comercial-management/sales-panel') || currentUrl === '/tienda' || currentUrl === '/';
        return hasAdminToken && !isBuyerPortal;
    }

    logOut() {
        const token = localStorage.getItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('redirect');

        if (!token) {
            this.router.navigate(['/home']);
            return;
        }

        this.userService.logOutUser().subscribe({
            next: () => {
                this.router.navigate(['/home']);
            },
            error: () => {
                this.router.navigate(['/home']);
            }
        });
    }
}
