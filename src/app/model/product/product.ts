  export interface ICreateProduct {
    name: string;
    category: string;
    beverageFormat: string;
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
}