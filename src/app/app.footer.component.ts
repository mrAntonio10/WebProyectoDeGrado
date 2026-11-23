import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer" style="background: #fff9f3; border-top: 4px solid #009fe3; padding: 1rem 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="assets/layout/images/myImg/rekids-logo.jpg" alt="RE KIDS"
                        style="height: 42px; border-radius: 8px; object-fit: contain; background: #fff; padding: 2px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />
                    <div>
                        <div style="font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.03em;">
                            <span style="color: #E30613;">R</span>
                            <span style="color: #009FE3;">E</span>
                            <span>&nbsp;</span>
                            <span style="color: #F39200;">K</span>
                            <span style="color: #76B82A;">I</span>
                            <span style="color: #E30613;">D</span>
                            <span style="color: #009FE3;">S</span>
                            <span style="color: #3C3C3B; font-size: 0.82rem; margin-left: 8px;">— EL SEGUNDO ESTRENO</span>
                        </div>
                        <div style="font-size: 0.78rem; color: #64748b;">
                            Tienda Online de Prendas Infantiles • Santa Cruz &amp; La Paz • Pago Rápido con QR
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: #E30613; display: inline-block;"></span>
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: #009FE3; display: inline-block;"></span>
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: #F39200; display: inline-block;"></span>
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: #76B82A; display: inline-block;"></span>
                </div>
            </div>
        </div>
    `
})
export class AppFooterComponent {
}
