export const REKIDS_LOGIN_CONFIG = {
  appName: 'Rekids — Portal Administrador',
  subtitle: 'Acceso exclusivo para Administradores del sistema',
  adminRedirectUrl: '/dashboard/management/events',
  publicStoreUrl: '/dashboard/comercial-management/sales-panel',
  allowedAdminAccounts: [
    { email: 'admin@gmail.com', password: 'admin', role: 'ADMIN', name: 'ADMIN Administrator' },
    { email: 'root@gmail.com', password: 'root', role: 'ROOT', name: 'ROOT Administrator' }
  ]
};
