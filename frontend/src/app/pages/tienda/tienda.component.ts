import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { BarraSuperiorTiendaComponent } from './componentes/barra-superior-tienda/barra-superior-tienda.component';
import { TransaccionesTiendaComponent } from './componentes/transacciones-tienda/transacciones-tienda.component';
import { AlertasStockComponent } from './componentes/alertas-stock/alertas-stock.component';
import { ModalPosComponent } from './componentes/modal-pos/modal-pos.component';
import { ModalCrearProductoComponent } from './componentes/modal-crear-producto/modal-crear-producto.component';
import { ModalInventarioComponent } from './componentes/modal-inventario/modal-inventario.component';
import { ModalReportesTiendaComponent } from './componentes/modal-reportes-tienda/modal-reportes-tienda.component';
import { ModalArqueoTiendaComponent } from './componentes/modal-arqueo-tienda/modal-arqueo-tienda.component';
import { ProductoService } from '../../services/producto.service';
import { VentaService } from '../../services/venta.service';
import { VentaProductoService } from '../../services/venta-producto.service';
import { CierreCajaService } from '../../services/cierre-caja.service';
import { BitacoraService } from '../../services/bitacora.service';

const UMBRAL_STOCK_BAJO = 5;
const COLORES = ['blue', 'orange', 'red', 'green'];

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule,
    BarraSuperiorTiendaComponent,
    TransaccionesTiendaComponent,
    AlertasStockComponent,
    ModalPosComponent,
    ModalCrearProductoComponent,
    ModalInventarioComponent,
    ModalReportesTiendaComponent,
    ModalArqueoTiendaComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {
  private toastr = inject(ToastrService);
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private ventaProductoService = inject(VentaProductoService);
  private cierreCajaService = inject(CierreCajaService);
  private bitacoraService = inject(BitacoraService);

  readonly umbralStockBajo = UMBRAL_STOCK_BAJO;

  fechaActual = '';
  usuarioActual = 'Encargado de Tienda';
  fechaMaximaVisible = '';

  catalogo: any[] = [];
  categorias: string[] = [];
  ventasRecientes: any[] = [];
  inventarioCritico: any[] = [];
  ventasTurno = 0;
  cargando = false;
  errorCarga = false;
  procesando = false;

  private ventasApi: any[] = [];
  private detallesApi: any[] = [];

  mostrarModalPOS = false;
  mostrarModalCrearProducto = false;
  mostrarModalInventario = false;
  mostrarModalReportes = false;
  mostrarModalArqueo = false;
  productoParaReponer: any = null;

  ngOnInit() {
    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.fechaActual = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    this.fechaMaximaVisible = this.hoyISO();
    this.cargarDatos();
  }

  private leerTicketsLocales(): Record<string, any> {
    const crudo = localStorage.getItem('kombat_tickets_tienda');
    if (!crudo) return {};
    try {
      return JSON.parse(crudo);
    } catch {
      return {};
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      ventas: this.ventaService.obtenerVentas(),
      detalles: this.ventaService.obtenerDetalles()
    }).subscribe({
      next: ({ productos, ventas, detalles }) => {
        const listaProd = Array.isArray(productos) ? productos : [];
        this.catalogo = listaProd
          .map(p => ({
            id: p.id,
            nombre: p.nombre,
            sku: p.sku,
            precio: Number(p.precio),
            stock: Number(p.stock),
            categoria: p.categoria,
            color: this.colorDeCategoria(p.categoria)
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.ventasApi = Array.isArray(ventas) ? ventas : [];
        this.detallesApi = Array.isArray(detalles) ? detalles : [];
        this.actualizarDerivados();
        this.cargando = false;
        this.errorCarga = false;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
      }
    });
  }

  private actualizarDerivados(): void {
    this.categorias = [...new Set(this.catalogo.map(p => p.categoria))].sort();
    this.inventarioCritico = this.catalogo
      .filter(p => p.stock <= UMBRAL_STOCK_BAJO)
      .sort((a, b) => a.stock - b.stock);

    const hoy = this.hoyISO();
    this.ventasTurno = this.ventasApi
      .filter(v => v.fecha === hoy)
      .reduce((acc, v) => acc + Number(v.total ?? 0), 0);

    const nombres = new Map(this.catalogo.map(p => [p.id, p.nombre] as [number, string]));
    const itemsPorVenta = new Map<number, string[]>();
    for (const d of this.detallesApi) {
      const lista = itemsPorVenta.get(d.venta) ?? [];
      const nombreProd = nombres.get(d.producto) ?? `Producto #${d.producto}`;
      lista.push(`${nombreProd} (x${d.cantidad})`);
      itemsPorVenta.set(d.venta, lista);
    }

    const metaTickets = this.leerTicketsLocales();

    this.ventasRecientes = this.ventasApi.slice(0, 8).map(v => {
      const meta = metaTickets[String(v.id)] ?? {};
      const modPago = String(meta.modalidadPago ?? '');
      const esPendiente = modPago.includes('finalizar');
      const itemsLista = itemsPorVenta.get(v.id) ?? ['Productos de tienda'];
      return {
        id: v.id,
        ticket: `TKT-${String(v.id).padStart(3, '0')}`,
        cliente: meta.clienteNombre ? meta.clienteNombre : 'Cliente en Tienda',
        telefono: meta.telefono ? meta.telefono : '',
        rolCliente: meta.rolCliente ? meta.rolCliente : 'Estudiante',
        vendedor: meta.vendedor ? meta.vendedor : this.usuarioActual,
        items: meta.resumenItems ? meta.resumenItems : itemsLista.join(', '),
        total: Number(v.total),
        hora: v.fecha === hoy ? (v.hora ?? '') : `${v.fecha?.slice(8, 10)}/${v.fecha?.slice(5, 7)} ${v.hora ?? ''}`,
        estado: esPendiente ? 'Pago fin entreno' : 'Pagado',
        color: esPendiente ? 'orange' : 'green'
      };
    });
  }

  private hoyISO(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  private colorDeCategoria(categoria: string): string {
    const texto = categoria ? categoria : '';
    const suma = [...texto].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return COLORES[suma % COLORES.length];
  }

  abrirModal(modal: string) {
    this.productoParaReponer = null;
    this.cargarDatos();
    if (modal === 'pos') this.mostrarModalPOS = true;
    if (modal === 'crear-producto') this.mostrarModalCrearProducto = true;
    if (modal === 'inventario') this.mostrarModalInventario = true;
    if (modal === 'reportes') this.mostrarModalReportes = true;
    if (modal === 'arqueo') this.mostrarModalArqueo = true;
  }

  abrirReposicionDirecta(prod: any) {
    this.productoParaReponer = prod;
    this.mostrarModalInventario = true;
  }

  cerrarModales() {
    this.mostrarModalPOS = false;
    this.mostrarModalCrearProducto = false;
    this.mostrarModalInventario = false;
    this.mostrarModalReportes = false;
    this.mostrarModalArqueo = false;
    this.productoParaReponer = null;
  }

  procesarVentaPOS(evento: {
    items: { producto_id: number; cantidad: number; nombre: string; precio: number; subtotal: number }[];
    clienteNombre: string;
    telefono: string;
    rolCliente: string;
    modalidadPago: string;
    enviarWhatsApp: boolean;
    vendedor: string;
  }) {
    if (this.procesando) return;
    this.procesando = true;

    const payload = evento.items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }));
    const resumenItems = evento.items.map(i => `${i.nombre} (x${i.cantidad})`).join(', ');
    const totalPedido = evento.items.reduce((acc, i) => acc + i.subtotal, 0);

    this.ventaProductoService.venderCarrito(payload).subscribe({
      next: (r) => {
        this.procesando = false;
        const ventaId = r.venta_id ? r.venta_id : Date.now();
        const metaTickets = this.leerTicketsLocales();
        metaTickets[String(ventaId)] = {
          clienteNombre: evento.clienteNombre,
          telefono: evento.telefono,
          rolCliente: evento.rolCliente,
          modalidadPago: evento.modalidadPago,
          resumenItems: resumenItems,
          vendedor: evento.vendedor
        };
        localStorage.setItem('kombat_tickets_tienda', JSON.stringify(metaTickets));

        this.bitacoraService.registrarEvento(
          'Venta Kiosko / Tienda',
          'Tienda POS',
          `Cliente: ${evento.clienteNombre} (${evento.rolCliente}) - ${resumenItems} - Total: Bs ${totalPedido} (${evento.modalidadPago})`
        ).subscribe();

        if (evento.enviarWhatsApp && evento.telefono) {
          this.abrirWhatsAppTicket({
            ticket: `TKT-${String(ventaId).padStart(3, '0')}`,
            cliente: evento.clienteNombre,
            rolCliente: evento.rolCliente,
            telefono: evento.telefono,
            items: resumenItems,
            total: totalPedido,
            estado: evento.modalidadPago,
            vendedor: evento.vendedor
          });
        }

        this.toastr.success(`Pedido de ${evento.clienteNombre} registrado.`, 'Venta Exitosa');
        this.cerrarModales();
        this.cargarDatos();
      },
      error: (e) => {
        this.procesando = false;
        const msg = e.error?.error ?? 'No se pudo registrar la venta.';
        this.toastr.error(msg, 'Error');
        this.cargarDatos();
      }
    });
  }

  abrirWhatsAppTicket(venta: any) {
    const telBruto = venta.telefono ? String(venta.telefono) : '';
    const numero = telBruto.replace(/\D/g, '');
    if (!numero) return;
    const prefijo = numero.startsWith('591') ? numero : `591${numero}`;
    const rol = venta.rolCliente ? venta.rolCliente : 'Atleta';
    const atendido = venta.vendedor ? venta.vendedor : this.usuarioActual;
    const texto =
      `Hola *${venta.cliente}* (${rol}), aquí tienes tu ticket de *Kiosko KOMBAT* (${venta.ticket}):\n\n` +
      `*PRODUCTOS:* ${venta.items}\n` +
      `*TOTAL A PAGAR: Bs ${Number(venta.total).toFixed(2)}*\n` +
      `Estado: ${venta.estado}\n` +
      `Entregado por: ${atendido}\n\n` +
      `Recuerda abonar al finalizar tu entrenamiento. ¡Éxitos en el tatami!`;

    const url = `https://wa.me/${prefijo}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  guardarAjusteStock(evento: { producto: any; modo: 'agregar' | 'fijar'; cantidad: number }) {
    const n = Number(evento.cantidad);
    if (!Number.isInteger(n) || n < 0 || (evento.modo === 'agregar' && n < 1)) {
      this.toastr.warning('Ingresa una cantidad válida.', 'Stock');
      return;
    }

    const cambio = evento.modo === 'agregar' ? { incremento: n } : { stock: n };
    this.productoService.ajustarStock(evento.producto.id, cambio).subscribe({
      next: (r) => {
        this.toastr.success(`${r.producto}: ${r.stock_actual} unidades disponibles.`, 'Stock Actualizado');
        this.cargarDatos();
      },
      error: () => {
        this.toastr.error('No se pudo actualizar el stock.', 'Error');
      }
    });
  }

  exportarAExcel(filtros: { categoria: string; fechaInicio: string; fechaFin: string }) {
    const { categoria, fechaInicio, fechaFin } = filtros;
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
      this.toastr.warning('Selecciona un rango de fechas válido.', 'Fechas');
      return;
    }

    const ventas = new Map(this.ventasApi.map(v => [v.id, v] as [number, any]));
    const productos = new Map(this.catalogo.map(p => [p.id, p] as [number, any]));
    const metaTickets = this.leerTicketsLocales();

    const filas: any[] = [];
    for (const d of this.detallesApi) {
      const venta = ventas.get(d.venta);
      if (!venta) continue;
      const fechaVenta = String(venta.fecha ?? '');
      const producto = productos.get(d.producto);
      const catProd = String(producto?.categoria ?? '');
      const coincideFecha = fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
      const coincideCat = categoria === 'todas' ? true : catProd === categoria;

      if (coincideFecha && coincideCat) {
        const meta = metaTickets[String(d.venta)] ?? {};
        filas.push({
          Fecha: fechaVenta,
          Hora: venta.hora ?? '',
          Ticket: `TKT-${String(venta.id).padStart(3, '0')}`,
          Cliente: meta.clienteNombre ? meta.clienteNombre : 'Cliente Tienda',
          Celular: meta.telefono ? meta.telefono : 'S/N',
          Producto: producto?.nombre ?? `Producto #${d.producto}`,
          Categoria: catProd,
          Cantidad: Number(d.cantidad),
          Subtotal_Bs: Number(d.subtotal),
          Estado: meta.modalidadPago ? meta.modalidadPago : (venta.metodo_pago ?? 'Efectivo')
        });
      }
    }

    if (filas.length === 0) {
      this.toastr.info('No hay ventas registradas en ese rango.', 'Sin datos');
      return;
    }

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Ventas_Tienda');
    XLSX.writeFile(libro, `Reporte_Tienda_${fechaInicio}_al_${fechaFin}.xlsx`);
    this.toastr.success('Reporte descargado correctamente.', 'Excel');
    this.cerrarModales();
  }

  procesarArqueo(montoFisico: number) {
    const dif = Math.round((montoFisico - this.ventasTurno) * 100) / 100;
    const nota = dif === 0 ? 'Cuadre exacto' : (dif > 0 ? `Sobrante: Bs ${dif}` : `Faltante: Bs ${Math.abs(dif)}`);

    this.cierreCajaService.registrarCierre({
      total_ingresos: montoFisico,
      observaciones: `Cierre Tienda. Ventas turno: Bs ${this.ventasTurno.toFixed(2)}. ${nota}`
    }).subscribe({
      next: () => {
        this.toastr.success(`Arqueo guardado por Bs ${montoFisico}.`, 'Caja Cerrada');
        this.cerrarModales();
      },
      error: () => {
        this.toastr.error('No se pudo guardar el arqueo.', 'Error');
      }
    });
  }
}
