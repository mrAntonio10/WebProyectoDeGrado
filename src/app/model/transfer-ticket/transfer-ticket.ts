export enum TicketStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',     
  REJECTED = 'REJECTED',
  PARTIALLY_DAMAGED = 'PARTIALLY_DAMAGED'
}

export enum TransferType {
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  EXTERNAL_SUPPLY = 'EXTERNAL_SUPPLY'
}

export interface ITransferTicket {
  id: string;
  transferType: TransferType;
  sourceId: string;           
  sourceName?: string;        // Para visualización en la tabla
  destinationId: string;      
  destinationName?: string;   // Para visualización
  currentStatus: TicketStatus;
  dateCreated: string | Date;
  details: ITransferDetail[]; 
  events: ITicketEvent[];     
}

export interface ITransferDetail {
  id?: string;
  productId: string;
  productName?: string;
  quantityShipped: number;
  quantityReceived?: number;  
  quantityDamaged?: number;   
}

export interface ITicketEvent {
  id?: string;
  ticketId?: string;
  statusChange: TicketStatus | string; 
  userId: string;             
  userName?: string;
  date: Date | string;
  comments: string;           
}

// Interfaz para la solicitud de creación desde UI (POST)
export interface ICreateTransferTicket {
  transferType: TransferType; // Identificar si viene de un proveedor externo o interno
  sourceId: string;    // ID del Proveedor O de la Sucursal emisora
  destinationId: string;
  details: {
    productId: string;
    quantityShipped: number;
  }[];
  comments?: string; 
}
