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
     * El menú hamburguesa se muestra siempre gracias al layout Flexbox
     * que evita que el ícono se sobreponga a la foto de la marca en dispositivos móviles.
     */
    get showHamburgerMenu(): boolean {
        return true;
    }

    get isAdmin(): boolean {
        return !!localStorage.getItem('token');
    }

    goToAboutUs(event: Event): void {
        event.preventDefault();
        this.router.navigate(['/dashboard/comercial-management/about-us']);
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
