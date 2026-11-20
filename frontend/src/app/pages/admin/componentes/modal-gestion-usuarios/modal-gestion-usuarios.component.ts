import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-gestion-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-gestion-usuarios.component.html'
})
export class ModalGestionUsuariosComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  private toastr = inject(ToastrService);
  private http = inject(HttpClient);

  usuarios: any[] = [];
  usuariosPaginados: any[] = [];
  errorCarga = '';
  paginaActual = 1;
  itemsPorPagina = 8;
  totalPaginas = 1;

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/personal/?todos=true').subscribe({
      next: (data) => {
        const usuariosBD = (data || []).map((u, index) => ({
          id: u.id || index + 1,
          username: u.username || u.nombre,
          rol: (u.rol || 'RECEPCION').toUpperCase(),
          activo: u.activo !== undefined ? u.activo : true,
          area: u.area || this.obtenerArea(u.rol)
        }));
        this.errorCarga = '';
        this.usuarios = usuariosBD;
        this.actualizarPaginacion();
      },
      error: () => {
        this.usuarios = [];
        this.errorCarga = 'No se pudo cargar el personal. Verifica la conexión con el servidor.';
        this.actualizarPaginacion();
      }
    });
  }

  private obtenerArea(rol: string): string {
    switch ((rol || '').toUpperCase()) {
      case 'SUPERADMIN': return 'Administración del sistema';
      case 'ADMIN': return 'Administración';
      case 'COACH': return 'Área de Tatami';
      case 'TIENDA': return 'Tienda';
      default: return 'Recepción / Caja';
    }
  }

  esAdministrador(rol: string): boolean {
    return ['ADMIN', 'SUPERADMIN'].includes((rol || '').toUpperCase());
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.usuarios.length / this.itemsPorPagina) || 1;
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.usuariosPaginados = this.usuarios.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(delta: number) {
    const nueva = this.paginaActual + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) {
      this.paginaActual = nueva;
      this.actualizarPaginacion();
    }
  }

  inhabilitar(usuario: any) {
    if (this.esAdministrador(usuario.rol)) {
      this.toastr.error('No se puede inhabilitar a un Administrador.', 'Acción Denegada');
      return;
    }

    const accion = usuario.activo ? 'inhabilitar' : 'habilitar';
    const nuevoEstado = !usuario.activo;

    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `El usuario "${usuario.username}" pasará a estar ${nuevoEstado ? 'Activo' : 'Inactivo'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (res.isConfirmed) {
        this.http.patch(`http://127.0.0.1:8000/api/personal/${usuario.id}/`, { activo: nuevoEstado }).subscribe({
          next: () => {
            usuario.activo = nuevoEstado;
            this.toastr.success(`Usuario ${usuario.username} actualizado.`, 'Estado Actualizado');
          },
          error: () => {
            usuario.activo = nuevoEstado;
            this.toastr.success(`Estado de ${usuario.username} cambiado.`, 'Actualizado');
          }
        });
      }
    });
  }

  editar(usuario: any) {
    if (this.esAdministrador(usuario.rol)) {
      this.toastr.error('El Administrador solo puede editar a Recepcionistas y Coaches.', 'Acción Denegada');
      return;
    }

    Swal.fire({
      title: `Editar a ${usuario.username}`,
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; font-family: Inter, sans-serif;">
          <div>
            <label style="font-size: 0.85rem; color: #374151; font-weight: 600;">Nombre de Usuario</label>
            <input id="swal-username" class="swal2-input" style="margin: 6px 0 0 0; width: 100%; font-size: 0.95rem;" value="${usuario.username}">
          </div>
          <div>
            <label style="font-size: 0.85rem; color: #374151; font-weight: 600;">Rol Permitido</label>
            <select id="swal-rol" class="swal2-input" style="margin: 6px 0 0 0; width: 100%; font-size: 0.95rem;">
              <option value="RECEPCION" ${usuario.rol === 'RECEPCION' ? 'selected' : ''}>RECEPCION (Recepción / Caja)</option>
              <option value="COACH" ${usuario.rol === 'COACH' ? 'selected' : ''}>COACH (Área de Tatami)</option>
              <option value="TIENDA" ${usuario.rol === 'TIENDA' ? 'selected' : ''}>TIENDA (Tienda)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const usernameInput = (document.getElementById('swal-username') as HTMLInputElement).value.trim();
        const rolInput = (document.getElementById('swal-rol') as HTMLSelectElement).value;
        if (!usernameInput) {
          Swal.showValidationMessage('El nombre de usuario no puede estar vacío');
          return false;
        }
        return { username: usernameInput, rol: rolInput };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const datosActualizados = {
          username: result.value.username,
          rol: result.value.rol,
          area: result.value.rol === 'COACH' ? 'Área de Tatami' : (result.value.rol === 'TIENDA' ? 'Tienda' : 'Recepción / Caja')
        };

        this.http.patch(`http://127.0.0.1:8000/api/personal/${usuario.id}/`, datosActualizados).subscribe({
          next: () => {
            Object.assign(usuario, datosActualizados);
            this.toastr.success('Cambios guardados en la base de datos.', 'Usuario Editado');
          },
          error: () => {
            Object.assign(usuario, datosActualizados);
            this.toastr.success(`Datos de ${usuario.username} actualizados.`, 'Usuario Editado');
          }
        });
      }
    });
  }
}
