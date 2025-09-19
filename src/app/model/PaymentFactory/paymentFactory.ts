export interface ICreateCharge {
    country: string;
    amount: string;
    currency: string;
    network?: string;
    idempotencyKey: string;
    chargeReason: string;
    callbak?: string;
    docNumber?: string;
    stereumJwt: string;
}
