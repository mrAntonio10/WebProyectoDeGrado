export interface IEnterprisePage {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface ICreateEnterprise {
    name: string;
    email: string;
    phoneNumber: string;
    description: string;
    logo: string;
}

export interface IUpdateEnterprise {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    description: string;
    logo: string;
    state: string;
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

export interface IEnterpriseState {
    id: string;
    name: string;
    state: string;
}