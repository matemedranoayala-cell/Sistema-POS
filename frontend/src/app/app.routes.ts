import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { DashboardPageComponent } from './components/dashboard/dashboard-page/dashboard-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'superadmin', component: DashboardPageComponent },
  { path: 'tienda', component: DashboardPageComponent },
  { path: 'recepcion', component: DashboardPageComponent },
  { path: 'coach', component: DashboardPageComponent },
  { path: 'entrenador', component: DashboardPageComponent }
];
