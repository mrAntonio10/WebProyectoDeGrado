import { IBranchOffice } from "../branchOffice/branchOffice";
import { IProduct, IProductList } from "../product/product";

export interface IWarehousePaged {
  id: string;
  productName: string;
  category: String;
  stock: number;
  unitaryCost: number;
  max: number;
  min: number;
  branchOfficeName: string;
}

export interface ICreateWarehouse {
  idProduct: string;
  idBranchOffice: string;
  stock: number;
  minProduct: number;
  maxProduct: number;
  unitaryCost: number;
}

export interface IUpdateWarehouse {
  id: string;
  idProduct: string;
  idBranchOffice: string;
  stock: number;
  minProduct: number;
  maxProduct: number;
  unitaryCost: number;
}

export interface IWarehouse {
  id: String;
  product: IProduct;
  stock: number;
  unitaryCost: number;
  maxProduct: number;
  minProduct: number;
  branchOffice: IBranchOffice;
}