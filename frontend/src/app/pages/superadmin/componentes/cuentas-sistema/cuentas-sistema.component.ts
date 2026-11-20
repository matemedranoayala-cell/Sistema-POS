import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CuentaSistema, SuperadminService } from '../../../../services/superadmin.service';

const LARGO_MINIMO = 8;

@Component({
  selector: 'app-cuentas-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuentas-sistema.component.html',
  styleUrls: ['../../superadmin-compartido.css', './cuentas-sistema.component.css']
})
export class CuentasSistemaComponent implements OnInit {
  private superadminService = inject(SuperadminService);
  private toastr = inject(ToastrService);

  readonly largoMinimo = LARGO_MINIMO;

  cuentas: CuentaSistema[] = [];
  busqueda = '';
  cargando = false;
  errorCarga = false;

  cuentaSeleccionada: CuentaSistema | null = null;
  nuevaContrasena = '';
  mostrarContrasena = false;
  guardando = false;
  contrasenaAsignada = '';

  ngOnInit(): void {
    this.cargarCuentas();
  }

  get cuentasFiltradas(): CuentaSistema[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.cuentas;
    return this.cuentas.filter(c =>
      c.username.toLowerCase().includes(q) || c.rol.toLowerCase().includes(q)
    );
  }

  cargarCuentas(): void {
    this.cargando = true;
    this.superadminService.listarCuentas().subscribe({
      next: cuentas => {
        this.cuentas = cuentas;
        this.cargando = false;
        this.errorCarga = false;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
      }
    });
  }

  etiquetaRol(rol: string): string {
    return rol.replace(/_/g, ' ');
  }

  abrirRestablecer(cuenta: CuentaSistema): void {
    this.cuentaSeleccionada = cuenta;
    this.nuevaContrasena = this.generarContrasena();
    this.mostrarContrasena = true;
    this.contrasenaAsignada = '';
  }

  @HostListener('document:keydown.escape')
  cerrarModal(): void {
    if (this.guardando) return;
    this.cuentaSeleccionada = null;
    this.nuevaContrasena = '';
    this.contrasenaAsignada = '';
  }

  generarContrasena(): string {
    // Sin caracteres que se confunden al dictarlos (0/O, 1/l/I).
    const caracteres = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const valores = new Uint32Array(10);
    crypto.getRandomValues(valores);
    return Array.from(valores, v => caracteres[v % caracteres.length]).join('');
  }

  regenerar(): void {
    this.nuevaContrasena = this.generarContrasena();
    this.mostrarContrasena = true;
  }

  guardar(): void {
    if (!this.cuentaSeleccionada || this.guardando) return;
    const clave = this.nuevaContrasena.trim();
    if (clave.length < LARGO_MINIMO) {
      this.toastr.warning(`La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`, 'Contraseña corta');
      return;
    }

    this.guardando = true;
    this.superadminService.restablecerContrasena(this.cuentaSeleccionada.username, clave).subscribe({
      next: () => {
        this.guardando = false;
        this.contrasenaAsignada = clave;
        this.toastr.success(`Contraseña de ${this.cuentaSeleccionada?.username} restablecida.`, 'Listo');
      },
      error: err => {
        this.guardando = false;
        this.toastr.error(err?.error?.error ?? 'No se pudo restablecer la contraseña.', 'Error');
      }
    });
  }

  copiar(): void {
    navigator.clipboard?.writeText(this.contrasenaAsignada).then(
      () => this.toastr.info('Contraseña copiada al portapapeles.', 'Copiado'),
      () => this.toastr.warning('No se pudo copiar. Cópiala manualmente.', 'Portapapeles')
    );
  }
}
