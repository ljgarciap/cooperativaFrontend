import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditoService, Credito } from '../../services/credito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  creditos: Credito[] = [];
  isUploading: boolean = false;
  isEditing: boolean = false;
  editingCredito: Partial<Credito> = {};

  constructor(private creditoService: CreditoService) {}

  ngOnInit(): void {
    this.loadCreditos();
  }

  loadCreditos(): void {
    this.creditoService.getCreditos().subscribe({
      next: (data) => this.creditos = data,
      error: (err) => console.error('Error loading credits:', err)
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      Swal.fire({
        title: 'Procesando PDF',
        text: 'Agente IA está analizando el documento...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.creditoService.uploadPdf(file).subscribe({
        next: (response) => {
          this.isUploading = false;
          Swal.close();
          if (response.status === 'success') {
            Swal.fire('¡Éxito!', 'Documento procesado y guardado.', 'success');
          } else {
            Swal.fire('Atención', response.message || 'El documento se procesó con advertencias.', 'warning');
          }
          this.loadCreditos();
        },
        error: (err) => {
          this.isUploading = false;
          Swal.close();
          console.error('Upload error:', err);
          Swal.fire('Error', 'No se pudo procesar el archivo. Revisa los logs.', 'error');
          this.loadCreditos();
        }
      });
    }
  }

  openEditModal(credito: Credito): void {
    this.editingCredito = { ...credito };
    this.isEditing = true;
  }

  closeEditModal(): void {
    this.isEditing = false;
    this.editingCredito = {};
  }

  saveEdit(): void {
    if (this.editingCredito.id) {
      this.creditoService.updateCredito(this.editingCredito.id, this.editingCredito).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Los datos se han guardado correctamente.', 'success');
          this.isEditing = false;
          this.loadCreditos();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo actualizar el registro.', 'error');
          console.error(err);
        }
      });
    }
  }

  deleteCredito(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.creditoService.deleteCredito(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido borrado.', 'success');
            this.loadCreditos();
          }
        });
      }
    });
  }

  viewFile(url: string | undefined): void {
    const fullUrl = this.creditoService.getFileUrl(url);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    } else {
      Swal.fire('Archivo no disponible', 'Este registro no tiene un PDF asociado.', 'info');
    }
  }

  approveCredit(id: number): void {
    this.creditoService.approveCredit(id).subscribe({
      next: () => {
        Swal.fire('Aprobado', 'El crédito ha sido aprobado correctamente.', 'success');
        this.loadCreditos();
      }
    });
  }

  rejectCredit(id: number): void {
    this.creditoService.rejectCredit(id).subscribe({
      next: () => {
        Swal.fire('Rechazado', 'El crédito ha sido rechazado.', 'error');
        this.loadCreditos();
      }
    });
  }

  downloadPdf(id: number): void {
    this.creditoService.downloadPdf(id);
  }

  // Consistency Validation
  targetComparison: Credito | null = null;
  
  startConsistencyCheck(credito: Credito): void {
    this.targetComparison = credito;
    const input = document.getElementById('consistencyInput') as HTMLInputElement;
    input.click();
  }

  onConsistencyFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && this.targetComparison) {
      Swal.fire({
        title: 'Validando Consistencia...',
        text: 'Comparando los datos del nuevo PDF con el registro actual.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.creditoService.validateConsistency(file).subscribe({
        next: (response) => {
          Swal.close();
          const extractedData = response?.data || {};
          this.showComparisonResults(this.targetComparison!, extractedData);
          this.targetComparison = null;
          event.target.value = ''; // Reset input
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo extraer la data para comparar.', 'error');
          this.targetComparison = null;
        }
      });
    }
  }

  showComparisonResults(original: Credito, extracted: any): void {
    let html = '<div style="text-align: left; font-size: 0.9rem;">';
    const fields = [
      { key: 'identificacion', label: 'Cédula' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'monto', label: 'Monto' },
      { key: 'tipo', label: 'Línea' }
    ];

    let hasDifferences = false;
    fields.forEach(f => {
      const origVal = original[f.key as keyof Credito];
      const newRaw = extracted ? extracted[f.key] : undefined;
      // Basic normalization for comparison
      const isMatch = newRaw !== undefined && 
                     String(origVal).toLowerCase().trim() === String(newRaw).toLowerCase().trim();
      
      const displayRaw = newRaw !== undefined ? newRaw : '<span style="color: #94a3b8;">No hallado</span>';
      
      html += `<div style="margin-bottom: 10px; padding: 10px; border-radius: 8px; background: ${isMatch ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isMatch ? '#bbf7d0' : '#fecaca'};">
                <strong>${f.label}:</strong><br>
                <span style="color: #64748b;">Sistema:</span> ${origVal}<br>
                <span style="color: #64748b;">Nuevo PDF:</span> ${displayRaw} 
                ${isMatch ? ' ✅' : ' ❌ <strong>(Diferencia detectada)</strong>'}
              </div>`;
      if (!isMatch) hasDifferences = true;
    });

    html += '</div>';

    Swal.fire({
      title: 'Resultado de Validación',
      html: html,
      icon: hasDifferences ? 'warning' : 'success',
      confirmButtonText: 'Entendido',
      width: '500px'
    });
  }

  getCountByEstado(estado: string): number {
    return this.creditos.filter(c => c.estado === estado).length;
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'status-approved';
      case 'RECHAZADO': return 'status-rejected';
      case 'DESEMBOLSADO': return 'status-disbursed';
      default: return 'status-pending';
    }
  }
}
