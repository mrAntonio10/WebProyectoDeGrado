export interface ICreateDocument {
    totalDiscount: number;
    totalPrice: number;
    paymentMethod: string;
    deliveryInformation: string;
    isInvoiced: boolean;
    clientName?: string;
    clientPhone?: string;
    channel?: string;
    region?: string;

    detailList: IDetailList[];
}

export interface IDetailList {
    totalDiscount: number;
    totalPrice: number;
    quantity: number;
    unitaryCost: number;

    idProduct: String;
    sku?: string;
    productName?: string;
}

export interface ISalesUserDocumet {
    id: string;
    client: string;
    clientName?: string;
    clientPhone?: string;
    channel?: string;
    region?: string;
    salesDate: string;
    paymentMethod: string;
    totalPrice: number;
}

export interface ISalesDocumentInfo {
    id: string;
    salesDate: string;
    userPOS: string;
    paymentMethod: string;
    client: string;
    clientName?: string;
    clientPhone?: string;
    channel?: string;
    region?: string;
    totalDiscount: number;
    totalPrice: number;

    detailInfoList: IDetailInfo[];
}

export interface IDetailInfo {
    sku: string;
    productName: string;
    quantity: number;
    unitaryPrice: number;
    productDiscount: number;
    total: number;
}
