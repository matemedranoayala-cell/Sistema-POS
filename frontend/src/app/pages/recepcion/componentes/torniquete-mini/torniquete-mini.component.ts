import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TorniqueteService } from '../../../../services/torniquete.service';

@Component({
  selector: 'app-torniquete-mini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './torniquete-mini.component.html'
})
export class TorniqueteMiniComponent implements OnInit {
  private torniqueteService = inject(TorniqueteService);

  criterioFiltro: 'dni' | 'nombre' | 'vencerse' | null = null;
  terminoBusqueda = '';
  todasLasAsistencias: any[] = [];
  asistenciasMostradas: any[] = [];
  busquedaActiva = false;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.torniqueteService.obtenerAsistencias().subscribe({
      next: (res) => {
        this.todasLasAsistencias = res;
        this.actualizarVista();
      },
      error: (err) => console.error(err)
    });
  }

  seleccionarFiltro(filtro: 'dni' | 'nombre' | 'vencerse') {
    this.criterioFiltro = filtro;
    this.actualizarVista();
  }

  ejecutarFiltro() {
    this.actualizarVista();
  }

  actualizarVista() {
    if (!this.criterioFiltro) {
      this.busquedaActiva = false;
      this.asistenciasMostradas = this.todasLasAsistencias.slice(0, 3);
      return;
    }

    this.busquedaActiva = this.criterioFiltro === 'vencerse' || this.terminoBusqueda.trim().length > 0;
    this.asistenciasMostradas = this.torniqueteService.filtrarAlumnos(
      this.todasLasAsistencias,
      this.criterioFiltro,
      this.terminoBusqueda
    );
  }

  marcarIngreso() {
    if (!this.criterioFiltro || !this.terminoBusqueda.trim()) return;

    const texto = this.terminoBusqueda.trim();
    let payload: any = {};

    if (this.criterioFiltro === 'dni') {
      payload = { dni: texto };
    } else if (this.criterioFiltro === 'nombre') {
      payload = { nombre: texto };
    } else {
      payload = { dni: texto, nombre: texto };
    }

    if (this.asistenciasMostradas.length === 1 && this.asistenciasMostradas[0].alumno) {
      payload.alumno_id = this.asistenciasMostradas[0].alumno;
    }

    this.torniqueteService.registrarIngreso(payload).subscribe({
      next: (res: any) => {
        this.todasLasAsistencias.unshift(res);
        this.terminoBusqueda = '';
        this.actualizarVista();

        if (res.clases_restantes <= 2 && res.clases_restantes >= 0 && res.estado === 'Permitido') {
          alert(`Atención: A ${res.nombre} le quedan ${res.clases_restantes} clases.`);
        }
      },
      error: () => alert('Alumno no encontrado o sin acceso.')
    });
  }

  obtenerPlaceholder(): string {
    if (!this.criterioFiltro) {
      return 'Primero presiona un botón de filtro arriba para habilitar el buscador...';
    }
    if (this.criterioFiltro === 'dni') {
      return 'Escribe el DNI / CI del alumno y presiona Marcar Ingreso...';
    }
    if (this.criterioFiltro === 'nombre') {
      return 'Escribe el nombre del alumno y presiona Marcar Ingreso...';
    }
    return 'Filtra por nombre o DNI dentro de los próximos a vencer...';
  }

  enviarRecordatorioRenovacion(alumno: any) {
    const telefono = String(alumno.telefono || '').replace(/\D/g, '');
    if (!telefono) {
      alert('El alumno no tiene número de teléfono registrado.');
      return;
    }

    const prefijo = telefono.startsWith('591') ? telefono : `591${telefono}`;
    const linkQr = 'https://i.imgur.com/TuQrDePago.png';

    const mensaje = `Hola *${alumno.nombre}*, te escribimos de *Altitud MMA*.\n\nTe recordamos que tu suscripción está por agotarse (te quedan *${alumno.clases_restantes} clases*).\n\n¿Deseas renovar tu plan? Puedes pagar escaneando el QR del dueño aquí: ${linkQr}\n\n¡Nos vemos en el tatami! 🥋`;

    const url = `https://wa.me/${prefijo}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
}
