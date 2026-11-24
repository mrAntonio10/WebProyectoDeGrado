import { IStoreEvent } from 'src/app/model/event/event';
import { IRekidsGarment } from 'src/app/model/product/product';
import { REKIDS_MOCK_GARMENTS } from '../../comercial-management/sales-panel/config';

export const ADMIN_EVENTS_CONFIG = {
  pageTitle: 'Portal Admin Rekids — Gestión de Eventos, Descuentos y Sincronización',
  defaultAdminEmail: 'admin@gmail.com',
  defaultAdminName: 'ADMIN Administrator (admin@gmail.com)',
  regions: [
    { label: 'Todas las Regiones (Santa Cruz y La Paz)', value: '' },
    { label: 'Tienda Santa Cruz', value: 'SANTA_CRUZ' },
    { label: 'Tienda La Paz', value: 'LA_PAZ' }
  ],
  discountTypes: [
    { label: 'Monto Fijo (BOB)', value: 'MONTO_FIJO' },
    { label: 'Porcentual (%)', value: 'PORCENTUAL' }
  ]
};

/**
 * Mock de prendas provenientes del endpoint externo (FeignClient) al presionar SINCRONIZAR
 */
export const EXTERNAL_FEIGN_SYNC_GARMENTS: IRekidsGarment[] = [];

export const INITIAL_ADMIN_EVENTS: IStoreEvent[] = [
  {
    id: 'evt-novedades',
    name: 'Novedades',
    code: 'NOVEDADES',
    description: 'Todas las prendas nuevas replicadas desde el sistema externo',
    isDefault: true,
    discountType: 'NONE',
    discountValue: 0,
    approvedByAdminName: 'Sistema Rekids (Evento Permanente)',
    approvedDate: Date.now() - 86400000,
    state: 'ACTIVE',
    products: []
  },
  {
    id: 'evt-descuentos',
    name: 'Descuentos',
    code: 'DESCUENTOS',
    description: 'Prendas con descuento fijo o porcentual aprobado por un administrador',
    isDefault: true,
    discountType: 'PORCENTUAL',
    discountValue: 20,
    approvedByAdminName: 'ADMIN Administrator (admin@gmail.com)',
    approvedDate: Date.now() - 3600000,
    state: 'ACTIVE',
    products: []
  }
];
