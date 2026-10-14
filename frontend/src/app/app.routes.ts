import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { InicioRecepcionComponent } from './pages/recepcion/inicio-recepcion/inicio-recepcion.component';
import { InicioCoachComponent } from './pages/coach/inicio-coach/inicio-coach.component';
import { SuperadminComponent } from './pages/superadmin/superadmin.component';
import { TiendaComponent } from './pages/tienda/tienda.component';
import { InicioAdminComponent } from './pages/admin/inicio-admin/inicio-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'superadmin', component: SuperadminComponent },
  { path: 'admin', component: InicioAdminComponent },
  { path: 'recepcion', component: InicioRecepcionComponent },
  { path: 'coach', component: InicioCoachComponent },
  { path: 'entrenador', redirectTo: 'coach', pathMatch: 'full' },
  { path: 'tienda', component: TiendaComponent },
  { path: '**', redirectTo: 'login' }
];
