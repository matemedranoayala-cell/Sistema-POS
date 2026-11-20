import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface BloqueIngresos {
  membresias: number;
  tienda: number;
  total: number;
}

export interface PrediccionProducto {
  producto_id: number;
  producto: string;
  stock: number;
  vendidos_periodo: number;
  ritmo_diario: number;
  dias_restantes: number;
  agota_en: string;
  sugerencia_compra: number;
  color: 'red' | 'orange' | 'green';
}

export interface FilaMapaCalor {
  dia: string;
  conteos: number[];
  valores: ('low' | 'med' | 'high' | 'max')[];
}

export interface ResumenSuperadmin {
  fecha: string;
  ingresos: { hoy: BloqueIngresos; mes: BloqueIngresos };
  alumnos: { alumnos_registrados: number; membresias_vigentes: number; visitas_hoy: number };
  inventario: { dias_analizados: number; productos: PrediccionProducto[] };
  mapa_calor: {
    semanas_analizadas: number;
    horas: string[];
    dias: FilaMapaCalor[];
    total_asistencias: number;
  };
  arqueos_pendientes: number;
}

export interface CuentaSistema {
  username: string;
  rol: string;
  activo: boolean;
}

export interface ArqueoCaja {
  id: number;
  fecha: string | null;
  hora: string;
  total_ingresos: number;
  observaciones: string;
  estado: 'Pendiente' | 'Verificado' | 'Observado' | string;
}

@Injectable({ providedIn: 'root' })
export class SuperadminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/superadmin/';

  obtenerResumen(): Observable<ResumenSuperadmin> {
    return this.http.get<ResumenSuperadmin>(`${this.apiUrl}resumen/`);
  }

  listarCuentas(): Observable<CuentaSistema[]> {
    return this.http.get<CuentaSistema[]>(`${this.apiUrl}cuentas/`);
  }

  restablecerContrasena(username: string, nuevaContrasena: string): Observable<{ username: string }> {
    return this.http.post<{ username: string }>(`${this.apiUrl}restablecer-contrasena/`, {
      username,
      nueva_contrasena: nuevaContrasena,
      usuario: this.auth.obtenerSesion().username
    });
  }

  listarArqueos(): Observable<ArqueoCaja[]> {
    return this.http.get<ArqueoCaja[]>(`${this.apiUrl}arqueos/`);
  }

  revisarArqueo(id: number, decision: 'Verificado' | 'Observado', nota: string): Observable<ArqueoCaja> {
    return this.http.post<ArqueoCaja>(`${this.apiUrl}arqueos/${id}/revisar/`, {
      decision,
      nota,
      usuario: this.auth.obtenerSesion().username
    });
  }
}
