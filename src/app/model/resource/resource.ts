  export interface IRolResourceDto {
    idRol: string;
    idResource: string;
    resourceName: string;
    resourcePriority: number;
    url: string;
    icon: string;
    childrenResources: IRolResourceDto[]
  }