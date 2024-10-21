export interface ICreateDocument {
    totalDiscount: number;
    totalPrice: number;
    paymentMethod: string;
    deliveryInformation: string;

    detailList: IDetailList[];
}

export interface IDetailList {
    totalDiscount: number;
    totalPrice: number;
    quantity: number;
    unitaryCost: number;

    idProduct: String;
}
