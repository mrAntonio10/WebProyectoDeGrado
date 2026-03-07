export interface ICreateDocument {
    totalDiscount: number;
    totalPrice: number;
    paymentMethod: string;
    deliveryInformation: string;
    isInvoiced: boolean;

    detailList: IDetailList[];
}

export interface IDetailList {
    totalDiscount: number;
    totalPrice: number;
    quantity: number;
    unitaryCost: number;

    idProduct: String;
}

export interface ISalesUserDocumet {
    id: string;
    client: string;
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
    totalDiscount: number;
    totalPrice: number

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