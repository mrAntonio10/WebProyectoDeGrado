export interface ICreateProduct {
  name: string;
  category: string;
  beverageFormat: string;
  photo?: string;
}

export interface IProductList {
  id: string;
  name: string;
  category: string;
}

export interface IProduct {
  id: string;
  name: string;
  category: string;
  beverageFormat: string;
  state: boolean;
  sku: string;
  photo?: string;
}

export interface IProductPage {
  id: string;
  name: string;
  category: string;
}