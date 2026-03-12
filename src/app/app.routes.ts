import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReconciliationComponent } from './components/reconciliation/reconciliation.component';
import { BitacoraListComponent } from './components/bitacora-list/bitacora-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reconciliation', component: ReconciliationComponent },
  { path: 'bitacora', component: BitacoraListComponent },
];
