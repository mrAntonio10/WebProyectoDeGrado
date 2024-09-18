  export interface UsuarioLoginI {
    email: string;
    password: string;
  }

  export interface ContentJwt {
    userId: string;
    secret: string;
  }

  export interface IUserDto {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    rol: string;
    state: string;
  }

  export interface ICreateUser {
    name: string;
    lastname: string;
    password: string;
    email: string; 
    phoneNumber: string;
    idBranchOffice: string;
    idRol: string;
  }

  export interface IUpdateUser {
    id: string;
    name: string;
    lastname: string;
    password: string;
    email: string; 
    phoneNumber: string;
    idRol: string;
    state: string;
  }

  export interface IUser {
    id: string;
    name: string;
    lastname: string;
    email: string; 
    phoneNumber: string;
    idRol: string;
    rol: String
    state: string;

    idBranchOffice: string;
    idEnterprise: string;
  }

