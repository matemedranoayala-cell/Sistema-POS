import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RecepcionComponent } from './pages/recepcion/recepcion.component';
import { CoachComponent } from './pages/coach/coach.component';
import { SuperadminComponent } from './pages/superadmin/superadmin.component';
import { TiendaComponent } from './pages/tienda/tienda.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'superadmin', component: SuperadminComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'recepcion', component: RecepcionComponent },
  { path: 'coach', component: CoachComponent },
  { path: 'entrenador', redirectTo: 'coach', pathMatch: 'full' },
  { path: 'tienda', component: TiendaComponent }
];
