import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConciliacionService, Conciliacion } from '../../services/conciliacion.service';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconciliation.component.html',
  styleUrl: './reconciliation.component.css'
})
export class ReconciliationComponent implements OnInit {
  conciliaciones: Conciliacion[] = [];
  selectedConciliacion: Conciliacion | null = null;

  constructor(private conciliacionService: ConciliacionService) { }

  ngOnInit(): void {
    this.loadConciliaciones();
  }

  onExcelSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.conciliacionService.uploadExcel(file).subscribe({
        next: () => {
          alert('Excel cargado. Generando conciliación automática...');
          setTimeout(() => this.loadConciliaciones(), 3000);
        },
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }

  loadConciliaciones(): void {
    this.conciliacionService.getConciliaciones().subscribe({
      next: (data) => {
        this.conciliaciones = data;
      },
      error: (err) => console.error('Error loading reconciliations', err)
    });
  }

  selectConciliacion(id: number): void {
    this.conciliacionService.getConciliacion(id).subscribe({
      next: (data) => {
        this.selectedConciliacion = data;
      },
      error: (err) => console.error('Error loading detail', err)
    });
  }

  closeDetail(): void {
    this.selectedConciliacion = null;
  }
}
