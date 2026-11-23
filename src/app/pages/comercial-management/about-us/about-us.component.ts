import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ISocialContactLink, REKIDS_LANDING_CONFIG, REKIDS_SOCIAL_LINKS } from './config';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  config = REKIDS_LANDING_CONFIG;
  socialLinks: ISocialContactLink[] = REKIDS_SOCIAL_LINKS.filter(link => link.platform !== 'whatsapp');

  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService
  ) {}

  get isAdmin(): boolean {
    return !!localStorage.getItem('token');
  }

  get adminEmail(): string {
    return localStorage.getItem('email') || 'admin@gmail.com';
  }

  ngOnInit(): void {
    this.breadcrumbService.setItems([
      { label: 'RE KIDS' },
      { label: 'Quiénes Somos' }
    ]);
  }

  onLogoClick(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToStore(regionCode?: string): void {
    if (regionCode) {
      sessionStorage.setItem('selectedRegion', regionCode);
    }
    this.router.navigate(['/dashboard/comercial-management/sales-panel']);
  }

  goToAdminPanel(): void {
    this.router.navigate(['/dashboard/management/events']);
  }
}
