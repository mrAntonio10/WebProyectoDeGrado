import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ISocialContactLink, REKIDS_SOCIAL_LINKS } from './pages/comercial-management/about-us/config';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer" style="background: #fff9f3; border-top: 4px solid #009fe3; padding: 1.25rem 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;">
                <!-- Logo y Marca (Click lleva a Quiénes Somos) -->
                <div style="display: flex; align-items: center; gap: 0.85rem; cursor: pointer;"
                     (click)="goToAboutUs()"
                     title="Ir a Quiénes Somos — RE KIDS">
                    <img src="assets/layout/images/myImg/rekids-logo.jpg" alt="RE KIDS"
                        style="height: 46px; border-radius: 10px; object-fit: contain; background: #fff; padding: 2px 7px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.15s ease;" />
                    <div>
                        <div style="font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 1.12rem; letter-spacing: 0.03em;">
                            <span style="color: #E30613;">R</span>
                            <span style="color: #009FE3;">E</span>
                            <span>&nbsp;</span>
                            <span style="color: #F39200;">K</span>
                            <span style="color: #76B82A;">I</span>
                            <span style="color: #E30613;">D</span>
                            <span style="color: #009FE3;">S</span>
                            <span style="color: #3C3C3B; font-size: 0.84rem; margin-left: 8px;">— EL SEGUNDO ESTRENO</span>
                        </div>
                        <div style="font-size: 0.78rem; color: #64748b; font-weight: 600;">
                            Tienda de Ropa Circular Infantil • Santa Cruz &amp; La Paz • Conoce Quiénes Somos
                        </div>
                    </div>
                </div>

                <!-- Iconos de Redes y Contacto Directo Siempre Visibles -->
                <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.55rem;">
                    <a *ngFor="let social of socialLinks"
                       [href]="social.url"
                       target="_blank"
                       rel="noopener noreferrer"
                       [title]="social.label + ' (' + social.sublabel + ')'"
                       class="rekids-footer-social-pill"
                       [ngStyle]="{'background': social.bgGradient}">
                        <!-- Facebook -->
                        <svg *ngIf="social.platform === 'facebook'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                        <!-- Instagram -->
                        <svg *ngIf="social.platform === 'instagram'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <!-- TikTok -->
                        <svg *ngIf="social.platform === 'tiktok'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                        <!-- WhatsApp -->
                        <svg *ngIf="social.platform === 'whatsapp'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.758.459 3.473 1.332 4.988L2 22l5.166-1.355a9.927 9.927 0 0 0 4.865 1.262h.004c5.515 0 9.969-4.453 9.969-9.969 0-2.663-1.037-5.167-2.92-7.05C17.201 3.037 14.694 2 12.031 2zm5.822 14.262c-.246.693-1.434 1.325-1.992 1.409-.513.077-1.162.109-1.875-.118-.432-.137-.986-.321-1.695-.627-2.981-1.287-4.928-4.289-5.077-4.488-.149-.198-1.212-1.612-1.212-3.075 0-1.462.766-2.181 1.039-2.479.273-.297.595-.372.793-.372.198 0 .397.002.57.01.183.009.428-.07.669.511.248.595.843 2.058.917 2.207.074.149.124.322.025.521-.099.198-.149.322-.298.496-.149.174-.313.388-.446.521-.149.148-.304.309-.131.606.174.298.771 1.272 1.655 2.06 1.137 1.014 2.096 1.328 2.393 1.477.298.149.471.124.645-.074.174-.199.744-.868.942-1.165.198-.298.397-.248.669-.149.273.099 1.735.818 2.033.967.298.149.496.223.57.347.075.124.075.719-.171 1.412z"/>
                        </svg>
                        <span>{{ social.label }}</span>
                    </a>
                </div>
            </div>
        </div>
    `
})
export class AppFooterComponent {
    socialLinks: ISocialContactLink[] = REKIDS_SOCIAL_LINKS;

    constructor(private router: Router) {}

    goToAboutUs(): void {
        this.router.navigate(['/dashboard/comercial-management/about-us']);
    }
}
