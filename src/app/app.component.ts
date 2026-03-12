import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SystemService } from './services/system.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cooperativaFrontend';

  constructor(private systemService: SystemService) {}

  resetSystem() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará todos los registros de créditos, bitácoras y conciliaciones de forma permanente. El sistema quedará vacío para nuevas pruebas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, limpiar todo',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Reiniciando...',
          text: 'Limpiando tablas de la base de datos',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.systemService.resetSystem().subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Reiniciado!',
              text: response.message,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            }).then(() => {
              // Reload page to refresh all components
              window.location.reload();
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: error.error?.message || 'Hubo un problema al reiniciar el sistema',
              icon: 'error',
              confirmButtonColor: '#3b82f6'
            });
          }
        });
      }
    });
  }
}
