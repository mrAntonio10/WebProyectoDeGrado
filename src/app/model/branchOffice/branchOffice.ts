import { IEnterpriseState } from "../enterprise/enterprise";

export interface IBranchOfficePage {
    id: string;
    name: string;
    location: string;
    invoice: boolean;
    state: string
}

export interface ICreateBranchOffice {
    name: string;
    location: string;
    phoneNumber: string;
    idEnterprise: string;
    invoice: boolean;
    inCode: string;
}

export interface IUpdateBranchOffice {
    id: string;
    name: string;
    location: string;
    phoneNumber: string;
    invoice: boolean;
    inCode: string;
    state: string;
}

export interface IBranchOffice {
    id: string;
    name: string;
    location: string;
    phoneNumber: string;
    state: string;
    invoice: boolean;
    inCode: string;
    enterprise: IEnterpriseState;
}