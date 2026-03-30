import { Component, OnInit } from '@angular/core';
import { DomainService } from '../../../services/domain/domain.service';
import { MessageService } from 'primeng/api';
import * as Notiflix from 'notiflix';

@Component({
  selector: 'app-domain-admin',
  templateUrl: './domain-admin.component.html',
  styleUrls: ['./domain-admin.component.scss'],
  providers: [MessageService]
})
export class DomainAdminComponent implements OnInit {

  masterDomains: any[] = [];
  selectedMasterDomain: string = '';

  domainValues: any[] = [];
  
  displayDialog: boolean = false;
  domainValueToEdit: any = { domain: '', name: '', description: '' };
  isEditMode: boolean = false;

  constructor(private domainService: DomainService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMasterDomains();
  }

  loadMasterDomains() {
    this.domainService.getMasterDomains().subscribe({
      next: (res) => {
        if (res.success || res.statusCode === 200 || res.status === 200) {
          this.masterDomains = res.data.map((d: string) => ({ label: d, value: d }));
          if (this.masterDomains.length > 0) {
            this.selectedMasterDomain = this.masterDomains[0].value;
            this.loadDomainValues();
          }
        }
      },
      error: (err) => {
        console.error('Error loading master domains', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los dominios principales.' });
      }
    });
  }

  onMasterDomainChange(event: any) {
    this.selectedMasterDomain = event.value;
    this.loadDomainValues();
  }

  loadDomainValues() {
    if (!this.selectedMasterDomain) return;

    this.domainService.getDomainValues(this.selectedMasterDomain).subscribe({
      next: (res) => {
        if (res.success || res.statusCode === 200 || res.status === 200) {
          this.domainValues = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading domain values', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los valores del dominio.' });
      }
    });
  }

  openNew() {
    this.domainValueToEdit = {
      domain: this.selectedMasterDomain,
      name: '',
      description: ''
    };
    this.isEditMode = false;
    this.displayDialog = true;
  }

  editDomainValue(val: any) {
    this.domainValueToEdit = { ...val };
    this.isEditMode = true;
    this.displayDialog = true;
  }

  deleteDomainValue(val: any) {
    Notiflix.Confirm.show(
      '¿Estás seguro?',
      `Eliminarás el valor: ${val.name}`,
      'Sí, eliminar',
      'Cancelar',
      () => {
        this.domainService.deleteDomainValue(val.id).subscribe({
          next: () => {
             this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Valor de dominio eliminado correctamente' });
             this.loadDomainValues();
          },
          error: (err) => {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo eliminar el valor de dominio' });
          }
        });
      },
      () => {}
    );
  }

  saveDomainValue() {
    if (!this.domainValueToEdit.name) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es requerido' });
      return;
    }

    if (this.isEditMode) {
      this.domainService.updateDomainValue(this.domainValueToEdit.id, this.domainValueToEdit).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Valor de dominio actualizado correctamente' });
          this.displayDialog = false;
          this.loadDomainValues();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar' });
        }
      });
    } else {
      this.domainService.createDomainValue(this.domainValueToEdit).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Valor de dominio creado correctamente' });
          this.displayDialog = false;
          this.loadDomainValues();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear' });
        }
      });
    }
  }

  hideDialog() {
    this.displayDialog = false;
  }
}
