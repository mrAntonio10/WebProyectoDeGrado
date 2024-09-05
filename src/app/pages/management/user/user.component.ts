import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnStructure, FormConfig } from 'src/app/demo/domain/columnDataStructure';
import { IBranchOffice, IBranchOfficePage, ICreateBranchOffice, IUpdateBranchOffice,  } from 'src/app/model/branchOffice/branchOffice';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';
import { ICreateUser, IUpdateUser, IUser, IUserDto } from 'src/app/model/user/usuario';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  pageableData: IBranchOfficePage;
  tableStructure: ColumnStructure[];
  gobalFilters;

  createFormStructure: FormConfig;
  submittedData: any;
  formData: any;

  idBranchOffice: string;

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.idBranchOffice = sessionStorage.getItem('idBranchOffice');

     //TODO get privileges...
     this.buildPageStructure();
     this.getUserPageableData(this.idBranchOffice);
 
     this.formData =  JSON.parse(sessionStorage.getItem('formData'));
 
     if (this?.formData?.action === 'create') this.submitCreateUser(this.formData);
     if (this?.formData?.action === 'update') this.submitUpdateUser(this.formData);

  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('formData');
  }


  private getUserPageableData(idEnterprise: String, params: any = { page: 0, size: 5, idBranchOffice: this.idBranchOffice}) {
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

        forkJoin([deleteObservable]).subscribe(
          ([deleted]) => {
              this.ngOnInit();
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
      {thead: 'Estado', value: 'state', ttype: 'text', visible: true, hasFilter: false, filterplaceholder: 'Buscar por estado'}
    ]

    this.gobalFilters = this.tableStructure.filter(column => column.visible).map(column => column.value);
  }

  onPageChange(event: any) {
    let params = { page: event.page, size: event.rows };

    this.getUserPageableData(this.idBranchOffice, params);
  }

  submitCreateUser(submittedData: ICreateUser) {
    let createObservable = this.userService.createUser(submittedData);

    forkJoin([createObservable]).subscribe(
      ([created]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }

  submitUpdateUser(submittedData: IUpdateUser) {
    let updateObservable = this.userService.updateUser(submittedData);

    forkJoin([updateObservable]).subscribe(
      ([created]) => {
        sessionStorage.removeItem('formData');
        this.ngOnInit(); 
      }
    )
  }

}
