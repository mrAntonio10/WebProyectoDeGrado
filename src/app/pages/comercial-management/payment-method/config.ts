export const PAYMENT_METHOD_CONFIG = {
  channel: 'ONLINE',
  defaultPaymentMethod: 'QR',
  currency: 'BOB',
  country: 'BO',
  paymentMethods: [
    { name: 'QR (Pago Online Rekids)', code: 'QR' }
  ],
  channels: [
    { name: 'ONLINE (Tienda Web Rekids)', code: 'ONLINE' }
  ],
  mockQrData: {
    bankName: 'Rekids QR Simple Bolivia (BOB)',
    accountLabel: 'REKIDS TIENDA INFANTIL ONLINE',
    referencePrefix: 'RK-QR-'
  }
};
