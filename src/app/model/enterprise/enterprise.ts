export interface IEnterprisePage {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface ICreateEnterprise {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    description: string;
    logo: string;
}

export interface IEnterprise {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    description: string;
    logo: string;
    state: string;
}