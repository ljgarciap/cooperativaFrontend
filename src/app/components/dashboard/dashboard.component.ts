import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditoService, Credito } from '../../services/credito.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  creditos: Credito[] = [];

  constructor(private creditoService: CreditoService) { }

  ngOnInit(): void {
    this.loadCreditos();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.creditoService.uploadPdf(file).subscribe({
        next: () => {
          alert('Archivo cargado con éxito. Procesando con IA...');
          setTimeout(() => this.loadCreditos(), 3000); // Wait for AI processing
        },
        error: (err) => alert('Error al cargar archivo: ' + err.message)
      });
    }
  }

  loadCreditos(): void {
    this.creditoService.getCreditos().subscribe({
      next: (data) => {
        this.creditos = data;
      },
      error: (err) => {
        console.error('Error fetching credits', err);
      }
    });
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE_ANALISIS': return 'status-pending';
      case 'APROBADO': return 'status-approved';
      case 'RECHAZADO': return 'status-rejected';
      case 'DESEMBOLSADO': return 'status-disbursed';
      default: return '';
    }
  }
}
