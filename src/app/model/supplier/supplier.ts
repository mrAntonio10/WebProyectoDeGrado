export interface ISupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  state: string; // Para active/inactive/deleted
}

export interface ICreateSupplier {
  name: string;
  contactName: string;
  phone: string;
}

export interface IUpdateSupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  state: string;
}
