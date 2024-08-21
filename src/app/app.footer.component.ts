import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer">
            <div class="grid">
                <div class="col">
                    <img src="assets/layout/images/logo-white.svg" alt="sapphire-layout" />
                    <div class="layout-footer-appname">PrimeNG Premium Template</div>
                </div>
                <div class="col">
                    <span>All Rights Reserved</span>
                </div>
            </div>
        </div>
    `
})
export class AppFooterComponent {

}
