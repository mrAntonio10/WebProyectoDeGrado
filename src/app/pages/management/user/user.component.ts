import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice,  } from 'src/app/model/branchOffice/branchOffice';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';
import { ICreateUser, IUpdateUser, IUser, IUserDto } from 'src/app/model/user/usuario';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { MessageService } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EnterpriseService } from 'src/app/services/enterprise/enterprise.service';
import { BranchOfficeService } from 'src/app/services/branchOffice/branchOffice.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  providers: [MessageService],
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  pageableData: IBranchOfficePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  actions: any = [];

  createFormStructure: FormConfig;
  isVisibleCreate: boolean;
  submittedData: any;
  formData: any;

  enterpriseList: any = [];
  branchOfficeList: any = [];

  formGroup: FormGroup;
  idBranchOfficeFilter : string;


  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private enterpriseService: EnterpriseService,
    private branchOfficeService: BranchOfficeService
  ) {

  }

  ngOnInit(): void {

     this.getUserPermissions();
     this.getUserPageableData();

     this.formGroup = this.buildForm();

     this.getEnterpriseCombo();
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (this?.formData?.action === 'create') this.submitCreateUser(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateUser(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }

  getUserPermissions() {
    let permissionsObservable = this.permissionService.getPermissionsByResourceUrl("/user");

    forkJoin([permissionsObservable]).subscribe(
      ([permission]) => {
        this.actions = [];

        console.log("PERMISOS ", permission.data);

        permission.data.forEach(permission => {
          switch (permission.permissionName) {
            case 'VIEW':
              this.buildPageStructure();
              break;
            case 'CREATE':
              this.isVisibleCreate = true;
              break;
            case 'DELETE':
              this.actions.unshift({icon: 'pi pi-lock', class: 'p-button-danger', actionName: 'block'})
              break;
            case 'UPDATE':
              this.actions.unshift({icon: 'pi pi-pencil', class: 'p-button-warning', actionName: 'edit'})
              this.actions.unshift({icon: 'pi pi-user', class: 'p-button-warning', actionName: 'branchOffice'})
              break;
          }
        });
      }
    )
  }


  private getUserPageableData(params: any = { page: 0, size: 5 }) {
    let userObservable = this.userService.getUserPageable(params);

    forkJoin([userObservable]).subscribe(
        ([users]) => {
            this.pageableData = users.data;
        }
    );
  }

  handleActionTriggered(event: { action: string, data: IUserDto }) {
    switch(event.action) {
      case 'block':
        this.blockUser(event.data);
        break;

      case 'edit':
        this.buildEditUser(event.data.id);
        break;

      }
  }

  blockUser(data: IUserDto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de bloquear al usuario ${data.fullname}?`,
      header: 'Eliminar usuario',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log(`Usuario con ID ${data.id} eliminado`);
        let deleteObservable = this.userService.deleteUser(data.id);

        forkJoin([deleteObservable]).subscribe({
          next:  ([deleted]) => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Usuario eliminado exitosamente.' });
            this.ngOnInit();
        }, 
        error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
          }
        }
      );
      },
      reject: () => {
        console.log('Acción de bloqueo cancelada');
      }
    });
  }

  buildEditUser(id: string) {
    this.activatedRoute.url.subscribe(urlSegments => {
      const fullPath = urlSegments.map(segment => segment.path).join('/');
      sessionStorage.setItem('fullPath', fullPath);

      let userObserable = this.userService.getUserById(id);

      let userData: IUser;
      forkJoin([userObserable]).subscribe(
          ([user]) => {
              userData = { ...user.data, action : 'update' };
              localStorage.setItem('dinamicFormConfig', JSON.stringify(userData));
              this.router.navigate(['/dashboard/management/user/create']);
          }
      );
    });
  }

  private buildPageStructure() {
    this.tableStructure = [
       // Nueva columna para acciones
      {thead: 'Acciones', value: 'actions', ttype: 'actions', visible: true, hasFilter: false},
      {thead: 'Id', value: 'id', ttype: 'text', visible: false, hasFilter: true, filterplaceholder: 'Buscar por id'},
      {thead: 'Nombre completo', value: 'fullname',ttype: 'text', visible: true, hasFilter: true, filterplaceholder: 'Buscar por nombre completo'},
      {thead: 'Email', value: 'email', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por email'},
      {thead: 'Celular', value: 'phoneNumber', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por celular'},
      {thead: 'Rol', value: 'rol', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por rol'},
      {thead: 'Sucursal', value: 'branchOfficeName', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por empresa'},
      {thead: 'Estado', value: 'state', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por estado'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  private getEnterpriseCombo() {
    let observableEnterpriseList= this.enterpriseService.getEnterpriseListCombo();

    forkJoin([observableEnterpriseList]).subscribe(
      ([enterprises]) => {
        this.enterpriseList = enterprises.data;
        this.enterpriseList.unshift({name: 'Todas las empresas', id: '', state: ''})
      }
    );
  }

  getBranchOfficeCombo(event) {
    console.log("EVENT ", event.value);

    let observableBranchOfficeList= this.branchOfficeService.getBranchOfficesListByIdEnterprise(event.value);

    forkJoin([observableBranchOfficeList]).subscribe(
      ([branchOffices]) => {
        this.branchOfficeList = branchOffices.data;
        this.branchOfficeList.unshift({name: 'Todas las sucursales', id: '', state: ''})
      }
    );
  }

  buildForm(): FormGroup {
    const group = this.fb.group({});

      group.addControl('idEnterprise', this.fb.control(''));
      group.addControl('idBranchOffice', this.fb.control(''));

      return group;
  }

  submitForm() {
    if (this.formGroup.valid) {
        console.log("aaaa", this.formGroup.value.idBranchOffice);

        this.idBranchOfficeFilter = this.formGroup.value.idBranchOffice;

        let params = { idBranchOffice: this.idBranchOfficeFilter };

        this.getUserPageableData(params);
    }
  }  

  onPageChange(event: any) {
    var getFilter = '';
    var branchOfficeFilter = '';

    if (event.filters && event.filters.fullname) {
        if (!!event.filters.fullname[0].value) {
            getFilter = event.filters.fullname[0].value;
        }
    }
    if(!!this.idBranchOfficeFilter) {
      branchOfficeFilter = this.idBranchOfficeFilter;
    }

    let params = { page: event.page, size: event.rows , filter: getFilter, branchOffice: branchOfficeFilter};

    this.getUserPageableData(params);
  }

  submitCreateUser(submittedData: ICreateUser) {
    let createObservable = this.userService.createUser(submittedData);

    forkJoin([createObservable]).subscribe({
      next:  ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Usuario creado exitosamente.' });
        this.ngOnInit(); 
      }, 
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    }
    )
  }

  submitUpdateUser(submittedData: IUpdateUser) {
    let updateObservable = this.userService.updateUser(submittedData);

    forkJoin([updateObservable]).subscribe({
      next: ([created]) => {
        sessionStorage.removeItem('formData');
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Usuario actualizado exitosamente.' });
        this.ngOnInit(); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.data.response });
      }
    }
    )
  }

}
