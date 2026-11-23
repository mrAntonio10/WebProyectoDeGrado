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
export const EXTERNAL_FEIGN_SYNC_GARMENTS: IRekidsGarment[] = [
  ...REKIDS_MOCK_GARMENTS,
  {
    id: 'garment-scz-005',
    externalId: 'EXT-SCZ-005',
    sku: 'RK-SCZ-005',
    name: 'Enterizo Navideño Reno Kids',
    productName: 'Enterizo Navideño Reno Kids',
    category: 'Conjuntos',
    size: '3T',
    color: 'Rojo / Blanco',
    gender: 'Unisex',
    brand: "Carter's",
    purchasePrice: 55,
    salePrice: 110,
    unitaryCost: 110,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 110,
    region: 'SANTA_CRUZ',
    stock: 4,
    photo: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades', 'Navidad']
  },
  {
    id: 'garment-lpz-005',
    externalId: 'EXT-LPZ-005',
    sku: 'RK-LPZ-005',
    name: 'Parka Polar Invierno Andino',
    productName: 'Parka Polar Invierno Andino',
    category: 'Abrigos y Chamarras',
    size: '8',
    color: 'Verde Bosque',
    gender: 'Niño',
    brand: 'Columbia Kids',
    purchasePrice: 120,
    salePrice: 230,
    unitaryCost: 230,
    discountType: 'NONE',
    discountValue: 0,
    finalPrice: 230,
    region: 'LA_PAZ',
    stock: 2,
    photo: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    eventNames: ['Novedades']
  }
];

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
    products: REKIDS_MOCK_GARMENTS.filter(g => g.isNew).map(g => ({
      productId: g.id,
      sku: g.sku,
      productName: g.name,
      category: g.category,
      size: g.size,
      color: g.color,
      gender: g.gender,
      brand: g.brand,
      region: g.region,
      photo: g.photo,
      originalPrice: g.salePrice,
      discountType: g.discountType || 'NONE',
      discountValue: g.discountValue || 0,
      finalPrice: g.finalPrice || g.salePrice,
      approvedByAdminName: g.discountApprovedBy || 'ADMIN Administrator (admin@gmail.com)',
      approvedDate: g.discountApprovedDate || Date.now()
    }))
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
    products: REKIDS_MOCK_GARMENTS.filter(g => (g.discountValue || 0) > 0).map(g => ({
      productId: g.id,
      sku: g.sku,
      productName: g.name,
      category: g.category,
      size: g.size,
      color: g.color,
      gender: g.gender,
      brand: g.brand,
      region: g.region,
      photo: g.photo,
      originalPrice: g.salePrice,
      discountType: g.discountType || 'PORCENTUAL',
      discountValue: g.discountValue || 0,
      finalPrice: g.finalPrice || g.salePrice,
      approvedByAdminName: g.discountApprovedBy || 'ADMIN Administrator (admin@gmail.com)',
      approvedDate: g.discountApprovedDate || Date.now()
    }))
  },
  {
    id: 'evt-navidad',
    name: 'Navidad',
    code: 'NAVIDAD',
    description: 'Prendas seleccionadas para la campaña de Navidad',
    isDefault: false,
    discountType: 'NONE',
    discountValue: 0,
    approvedByAdminName: 'ADMIN Administrator (admin@gmail.com)',
    approvedDate: Date.now() - 7200000,
    state: 'ACTIVE',
    products: REKIDS_MOCK_GARMENTS.filter(g => (g.eventNames || []).includes('Navidad')).map(g => ({
      productId: g.id,
      sku: g.sku,
      productName: g.name,
      category: g.category,
      size: g.size,
      color: g.color,
      gender: g.gender,
      brand: g.brand,
      region: g.region,
      photo: g.photo,
      originalPrice: g.salePrice,
      discountType: g.discountType || 'NONE',
      discountValue: g.discountValue || 0,
      finalPrice: g.finalPrice || g.salePrice,
      approvedByAdminName: 'ADMIN Administrator (admin@gmail.com)',
      approvedDate: Date.now() - 7200000
    }))
  }
];
