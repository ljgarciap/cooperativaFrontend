import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConciliacionService, Conciliacion } from '../../services/conciliacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.css']
})
export class ReconciliationComponent implements OnInit {
  conciliaciones: Conciliacion[] = [];
  selectedConciliacion: Conciliacion | null = null;
  isUploading = false;
  showOnlyPending = false;
  
  // Stats helpers
  get totalExtractoPendiente(): number {
    return this.selectedConciliacion?.extracto_items
      ?.filter(i => !this.isConciliado(i))
      .reduce((acc, curr) => acc + curr.valor, 0) || 0;
  }

  get totalAuxiliarPendiente(): number {
    return this.selectedConciliacion?.auxiliar_items
      ?.filter(i => !this.isConciliado(i))
      .reduce((acc, curr) => acc + curr.valor, 0) || 0;
  }

  get filteredExtracto() {
    if (!this.selectedConciliacion?.extracto_items) return [];
    return this.showOnlyPending 
      ? this.selectedConciliacion.extracto_items.filter(i => !this.isConciliado(i))
      : this.selectedConciliacion.extracto_items;
  }

  get filteredAuxiliar() {
    if (!this.selectedConciliacion?.auxiliar_items) return [];
    return this.showOnlyPending 
      ? this.selectedConciliacion.auxiliar_items.filter(i => !this.isConciliado(i))
      : this.selectedConciliacion.auxiliar_items;
  }

  public isConciliado(item: any): boolean {
    if (item.conciliado === true || item.conciliado === 1 || item.conciliado === '1') return true;
    return false;
  }
  
  // Upload Params
  uploadParams = {
    banco: 'BANCO_BOGOTA',
    mes: 'Marzo',
    anio: 2026,
    fuente: 'EXTRACTO'
  };

  showUploadModal = false;

  constructor(private conciliacionService: ConciliacionService) { }

  ngOnInit(): void {
    this.loadConciliaciones();
  }

  loadConciliaciones(): void {
    this.conciliacionService.getConciliaciones().subscribe({
      next: (data) => {
        this.conciliaciones = data;
      },
      error: (err) => {
        console.error('Error loading reconciliations', err);
        Swal.fire('Error', 'No se pudieron cargar las conciliaciones.', 'error');
      }
    });
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.showUploadModal = false;

    Swal.fire({
      title: 'Procesando Excel...',
      text: 'Estamos analizando y cargando los datos en el sistema.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.conciliacionService.uploadExcel(file, this.uploadParams).subscribe({
      next: (response) => {
        this.isUploading = false;
        Swal.fire({
          title: 'Procesamiento Iniciado',
          text: 'Estamos cargando tus datos. El dashboard se actualizará en un momento.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        
        // Un solo refresh a los 4 segundos para evitar el doble parpadeo
        setTimeout(() => this.loadConciliaciones(), 4000);
      },
      error: (err) => {
        this.isUploading = false;
        Swal.fire('Error en Carga', 'No se pudo procesar el archivo Excel. Revisa el formato.', 'error');
        console.error(err);
      }
    });
  }

  selectConciliacion(id: number): void {
    this.conciliacionService.getConciliacion(id).subscribe({
      next: (data) => {
        this.selectedConciliacion = data;
      },
      error: (err) => {
        console.error('Error loading detail', err);
        Swal.fire('Error', 'No se pudo cargar el detalle de la conciliación.', 'error');
      }
    });
  }

  closeDetail(): void {
    this.selectedConciliacion = null;
  }

  onReconcile(): void {
    if (!this.selectedConciliacion) return;

    Swal.fire({
      title: 'Conciliando...',
      text: 'Estamos cruzando movimientos de extracto vs auxiliar.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.conciliacionService.runReconciliation(this.selectedConciliacion.id).subscribe({
      next: (response) => {
        this.selectedConciliacion = response.data;
        Swal.fire('Conciliación Finalizada', 'Se han cruzado los movimientos coincidentes.', 'success');
        this.loadConciliaciones();
      },
      error: (err) => {
        console.error('Error in reconciliation', err);
        Swal.fire('Error', 'No se pudo realizar el cruce automático.', 'error');
      }
    });
  }

  getStatusClass(estado: string): string {
    const s = estado.toLowerCase();
    if (s.includes('pendiente') || s.includes('procesando')) return 'status-pending';
    if (s.includes('reconciliado') || s.includes('conciliado')) return 'status-approved';
    if (s.includes('discrepancia')) return 'status-rejected';
    return 'status-pending';
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
