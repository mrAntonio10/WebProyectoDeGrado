import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PermissionService } from 'src/app/services/permission/permission.service';
import { SupplierService } from 'src/app/services/supplier/supplier.service';
import { ISupplier } from 'src/app/model/supplier/supplier';
import { BreadcrumbService } from 'src/app/app.breadcrumb.service';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  providers: [MessageService]
})
export class SupplierComponent implements OnInit {

  suppliers: ISupplier[] = [];
  loading: boolean = false;

  // Permisos
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;

  // Dialog create/edit
  displayDialog: boolean = false;
  isEditMode: boolean = false;
  formGroup: FormGroup;
  selectedSupplier: ISupplier | null = null;

  states = [
    { name: 'Activo', code: 'ACTIVE' },
    { name: 'Inactivo', code: 'INACTIVE' }
  ];

  constructor(
    private supplierService: SupplierService,
    private permissionService: PermissionService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Gestión' },
      { label: 'Proveedores' }
    ]);
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadSuppliers();
    this.formGroup = this.buildForm();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      id:            [this.selectedSupplier?.id || ''],
      name:          [this.selectedSupplier?.name || '', [Validators.required, Validators.maxLength(120)]],
      contactName:   [this.selectedSupplier?.contactName || '', [Validators.required, Validators.maxLength(120)]],
      phone:         [this.selectedSupplier?.phone || '', [Validators.required, Validators.pattern('^[\\d]*$'), Validators.maxLength(20)]],
      state:         [this.selectedSupplier?.state || 'ACTIVE']
    });
  }

  private loadPermissions(): void {
    this.permissionService.getPermissionsByResourceUrl('/supplier').subscribe({
      next: (res) => {
        const permissions: any[] = res?.data || [];
        permissions.forEach(p => {
          switch (p.permissionName) {
            case 'CREATE': this.canCreate = true; break;
            case 'UPDATE': this.canUpdate = true; break;
            case 'DELETE': this.canDelete = true; break;
          }
        });
      }
    });
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores.' });
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.isEditMode = false;
    this.selectedSupplier = null;
    this.formGroup = this.buildForm();
    this.displayDialog = true;
  }

  openEdit(supplier: ISupplier): void {
    this.isEditMode = true;
    this.selectedSupplier = supplier;
    this.formGroup = this.buildForm();
    this.displayDialog = true;
  }

  submitForm(): void {
    if (this.formGroup.invalid) return;

    const value = this.formGroup.value;

    if (this.isEditMode) {
      this.supplierService.updateSupplier(value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Proveedor actualizado correctamente.' });
          this.displayDialog = false;
          this.loadSuppliers();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el proveedor.' })
      });
    } else {
      this.supplierService.createSupplier(value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Proveedor registrado correctamente.' });
          this.displayDialog = false;
          this.loadSuppliers();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el proveedor.' })
      });
    }
  }

  confirmDelete(supplier: ISupplier): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al proveedor "${supplier.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.supplierService.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Proveedor eliminado.' });
            this.loadSuppliers();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el proveedor.' })
        });
      }
    });
  }
}
