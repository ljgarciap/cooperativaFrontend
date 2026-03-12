import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConciliacionService, Bitacora } from '../../services/conciliacion.service';

@Component({
  selector: 'app-bitacora-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bitacora-list.component.html',
  styleUrl: './bitacora-list.component.css'
})
export class BitacoraListComponent implements OnInit {
  logs: Bitacora[] = [];

  constructor(private conciliacionService: ConciliacionService) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.conciliacionService.getBitacora().subscribe({
      next: (data) => this.logs = data,
      error: (err) => console.error('Error loading audit log', err)
    });
  }
}
