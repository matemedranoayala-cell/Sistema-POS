import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlumnoService } from '../../../../services/alumno.service';
import { PersonalService } from '../../../../services/personal.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-modal-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-pos.component.html'
})
export class ModalPosComponent implements OnInit {
  @Input() catalogo: any[] = [];
  @Input() cargando = false;
  @Input() procesando = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmarVenta = new EventEmitter<{
    items: { producto_id: number; cantidad: number; nombre: string; precio: number; subtotal: number }[];
    clienteNombre: string;
    telefono: string;
    rolCliente: string;
    modalidadPago: string;
    enviarWhatsApp: boolean;
    vendedor: string;
  }>();

  private toastr = inject(ToastrService);
  private alumnoService = inject(AlumnoService);
  private personalService = inject(PersonalService);
  private authService = inject(AuthService);

  busqueda = '';
  carrito: any[] = [];
  totalCarrito = 0;

  mostrarMiniFormCobro = false;
  busquedaMiembro = '';
  miembrosAcademia: { id: string; nombre: string; telefono: string; tipo: string; dni: string }[] = [];

  datosCobro = {
    clienteNombre: '',
    telefono: '',
    rolCliente: 'Estudiante',
    modalidadPago: 'Por cobrar al finalizar entreno'
  };

  ngOnInit() {
    this.cargarMiembrosPreguardados();
  }

  cargarMiembrosPreguardados() {
    const agendaGuardada = JSON.parse(localStorage.getItem('kombat_agenda_wp') || '{}');

    this.alumnoService.obtenerAlumnos().subscribe({
      next: (alumnos) => {
        const listaAlumnos = (alumnos || []).map(a => {
          const nombreCompleto = `${a.nombre || ''} ${a.apellidos || ''}`.trim();
          const tel = a.telefono || agendaGuardada[nombreCompleto.toLowerCase()] || '';
          return {
            id: `A-${a.id}`,
            nombre: nombreCompleto,
            telefono: String(tel),
            tipo: 'Estudiante',
            dni: String(a.dni || '')
          };
        });
        this.miembrosAcademia = [...this.miembrosAcademia, ...listaAlumnos];
      }
    });

    this.personalService.listarPersonal().subscribe({
      next: (personal) => {
        const listaPersonal = (personal || []).map(p => {
          const nombre = String(p.username || p.nombre || '');
          const rol = String(p.rol || 'COACH').toUpperCase();
          const tel = agendaGuardada[nombre.toLowerCase()] || '';
          return {
            id: `P-${p.id}`,
            nombre: nombre,
            telefono: String(tel),
            tipo: rol === 'COACH' ? 'Maestro / Coach' : 'Encargado',
            dni: rol
          };
        });
        this.miembrosAcademia = [...this.miembrosAcademia, ...listaPersonal];
      }
    });
  }

  get catalogoFiltrado(): any[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.catalogo;
    return this.catalogo.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      String(p.sku || '').toLowerCase().includes(q)
    );
  }

  get sugerenciasMiembros(): any[] {
    const q = this.busquedaMiembro.trim().toLowerCase();
    if (!q) return this.miembrosAcademia.slice(0, 5);
    return this.miembrosAcademia.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      m.dni.toLowerCase().includes(q) ||
      m.telefono.includes(q)
    ).slice(0, 5);
  }

  agregarAlCarrito(producto: any) {
    if (producto.stock <= 0) {
      this.toastr.warning(`${producto.nombre} está agotado.`, 'Sin stock');
      return;
    }

    const itemExistente = this.carrito.find(item => item.id === producto.id);
    if ((itemExistente?.cantidad ?? 0) >= producto.stock) {
      this.toastr.warning(`Solo hay ${producto.stock} unidad(es) de ${producto.nombre}.`, 'Stock máximo');
      return;
    }

    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
    } else {
      this.carrito.push({ ...producto, cantidad: 1, subtotal: producto.precio });
    }
    this.calcularTotal();
  }

  cambiarCantidad(index: number, delta: number) {
    const item = this.carrito[index];
    const nueva = item.cantidad + delta;
    if (nueva <= 0) {
      this.quitarDelCarrito(index);
      return;
    }
    if (nueva > item.stock) {
      this.toastr.warning(`Stock máximo alcanzado (${item.stock}).`, 'Stock');
      return;
    }
    item.cantidad = nueva;
    item.subtotal = item.cantidad * item.precio;
    this.calcularTotal();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  abrirFormularioCobro() {
    if (this.carrito.length === 0) return;
    this.mostrarMiniFormCobro = true;
  }

  seleccionarMiembro(miembro: any) {
    this.datosCobro.clienteNombre = miembro.nombre;
    this.datosCobro.telefono = miembro.telefono;
    this.datosCobro.rolCliente = miembro.tipo;
    this.busquedaMiembro = '';
  }

  get vistaPreviaMensaje(): string {
    const sesion = this.authService.obtenerSesion();
    const vendedor = sesion?.username || 'Encargado de Tienda';
    const cliente = this.datosCobro.clienteNombre.trim() || 'Atleta Kombat';
    const detalleProductos = this.carrito
      .map(i => `- ${i.cantidad}x ${i.nombre}: Bs ${i.subtotal}`)
      .join('\n');

    return (
      `Hola *${cliente}* (${this.datosCobro.rolCliente}), te enviamos tu ticket de *Kiosko KOMBAT*:\n\n` +
      `*PRODUCTOS PEDIDOS:*\n${detalleProductos}\n\n` +
      `*TOTAL A PAGAR: Bs ${this.totalCarrito.toFixed(2)}*\n` +
      `Estado: ${this.datosCobro.modalidadPago}\n` +
      `Atendido por: ${vendedor}\n\n` +
      `Puedes pasar a cancelar al finalizar tu entrenamiento. ¡Buen entreno!`
    );
  }

  finalizarYEnviar(enviarWhatsApp: boolean) {
    if (!this.datosCobro.clienteNombre.trim()) {
      this.toastr.warning('Selecciona o escribe el nombre del cliente.', 'Falta Cliente');
      return;
    }

    const telLimpio = this.datosCobro.telefono.replace(/\D/g, '');
    if (enviarWhatsApp && telLimpio.length < 7) {
      this.toastr.warning('Ingresa un número de celular válido para enviar el ticket por WhatsApp.', 'Falta Teléfono');
      return;
    }

    if (telLimpio) {
      const agendaGuardada = JSON.parse(localStorage.getItem('kombat_agenda_wp') || '{}');
      agendaGuardada[this.datosCobro.clienteNombre.trim().toLowerCase()] = telLimpio;
      localStorage.setItem('kombat_agenda_wp', JSON.stringify(agendaGuardada));
    }

    const sesion = this.authService.obtenerSesion();
    this.confirmarVenta.emit({
      items: this.carrito.map(i => ({
        producto_id: i.id,
        cantidad: i.cantidad,
        nombre: i.nombre,
        precio: i.precio,
        subtotal: i.subtotal
      })),
      clienteNombre: this.datosCobro.clienteNombre.trim(),
      telefono: telLimpio,
      rolCliente: this.datosCobro.rolCliente,
      modalidadPago: this.datosCobro.modalidadPago,
      enviarWhatsApp,
      vendedor: sesion?.username || 'Encargado de Tienda'
    });
  }
}
