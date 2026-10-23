import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { VentaRapidaComponent } from '../../compartido/componentes/venta-rapida/venta-rapida.component';
import { ProductoService } from '../../services/producto.service';
import { VentaService } from '../../services/venta.service';
import { VentaProductoService } from '../../services/venta-producto.service';
import { CierreCajaService } from '../../services/cierre-caja.service';

interface ProductoTienda {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  categoria: string;
  color: string;
}

interface ItemCarrito extends ProductoTienda {
  cantidad: number;
  subtotal: number;
}

interface VentaReciente {
  ticket: string;
  cliente: string;
  items: string;
  total: number;
  hora: string;
  estado: string;
  color: string;
}

type ModoAjuste = 'agregar' | 'fijar';

/** Stock igual o menor a este valor se considera critico (mismo valor que usa /api/productos/stock-bajo/). */
const UMBRAL_STOCK_BAJO = 5;
const COLORES = ['blue', 'orange', 'red', 'green'];

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VentaRapidaComponent],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private ventaProductoService = inject(VentaProductoService);
  private cierreCajaService = inject(CierreCajaService);

  @ViewChild(VentaRapidaComponent) ventaRapida?: VentaRapidaComponent;

  readonly umbralStockBajo = UMBRAL_STOCK_BAJO;

  fechaActual = '';
  usuarioActual = 'Encargado de Tienda';
  fechaMaximaVisible = ''; // Para bloquear fechas futuras

  /* --- Datos que vienen del backend --- */
  catalogo: ProductoTienda[] = [];
  categorias: string[] = [];
  ventasRecientes: VentaReciente[] = [];
  inventarioCritico: ProductoTienda[] = [];
  ventasTurno = 0; // Efectivo vendido hoy, para el arqueo
  cargando = false;
  errorCarga = false;

  private ventasApi: any[] = [];
  private detallesApi: any[] = [];

  /* --- Modales --- */
  mostrarModalPOS = false;
  mostrarModalInventario = false;
  mostrarModalReportes = false;
  mostrarModalArqueo = false;
  mostrarModalAjuste = false;

  reporteForm!: FormGroup;
  arqueoForm!: FormGroup;
  ajusteForm!: FormGroup;

  /* --- POS --- */
  carrito: ItemCarrito[] = [];
  totalCarrito = 0;
  busqueda = '';
  procesando = false;

  /* --- Ajuste de stock --- */
  productoAjuste: ProductoTienda | null = null;
  guardandoAjuste = false;

  ngOnInit() {
    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-BO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    this.fechaActual = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    this.fechaMaximaVisible = this.hoyISO();

    this.reporteForm = this.fb.group({
      categoria: ['todas'],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });

    this.arqueoForm = this.fb.group({
      montoFisico: ['', [Validators.required, Validators.min(0)]]
    });

    this.ajusteForm = this.fb.group({
      modo: ['agregar'],
      cantidad: [null, [Validators.required, Validators.min(0)]]
    });

    this.cargarDatos();
  }

  /* ============================================================
   *  CARGA DE DATOS
   * ============================================================ */
  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      ventas: this.ventaService.obtenerVentas(),
      detalles: this.ventaService.obtenerDetalles()
    }).subscribe({
      next: ({ productos, ventas, detalles }) => {
        this.catalogo = (productos || [])
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
        this.ventasApi = ventas || [];
        this.detallesApi = detalles || [];
        this.actualizarDerivados();
        this.cargando = false;
        this.errorCarga = false;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
        this.toastr.error('No se pudo conectar con el servidor.', 'Error de carga');
      }
    });
  }

  private actualizarDerivados(): void {
    this.categorias = [...new Set(this.catalogo.map(p => p.categoria))].sort();
    this.inventarioCritico = this.catalogo
      .filter(p => p.stock <= UMBRAL_STOCK_BAJO)
      .sort((a, b) => a.stock - b.stock || a.nombre.localeCompare(b.nombre));

    const hoy = this.hoyISO();
    this.ventasTurno = this.ventasApi
      .filter(v => v.fecha === hoy && (v.metodo_pago || 'Efectivo').toLowerCase() === 'efectivo')
      .reduce((acc, v) => acc + Number(v.total || 0), 0);

    const nombres = new Map(this.catalogo.map(p => [p.id, p.nombre] as [number, string]));
    const itemsPorVenta = new Map<number, string[]>();
    for (const d of this.detallesApi) {
      const lista = itemsPorVenta.get(d.venta) ?? [];
      lista.push(`${nombres.get(d.producto) ?? 'Producto #' + d.producto} (x${d.cantidad})`);
      itemsPorVenta.set(d.venta, lista);
    }

    // El backend devuelve las ventas de la mas nueva a la mas vieja
    this.ventasRecientes = this.ventasApi.slice(0, 8).map(v => ({
      ticket: `TKT-${String(v.id).padStart(3, '0')}`,
      cliente: 'Venta Anónima',
      items: (itemsPorVenta.get(v.id) ?? ['Venta sin detalle']).join(', '),
      total: Number(v.total),
      hora: v.fecha === hoy ? (v.hora ?? '') : `${v.fecha?.slice(8, 10)}/${v.fecha?.slice(5, 7)} ${v.hora ?? ''}`,
      estado: 'Pagado',
      color: 'green'
    }));
  }

  private hoyISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private colorDeCategoria(categoria: string): string {
    const suma = [...(categoria || '')].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return COLORES[suma % COLORES.length];
  }

  /** Refresca esta pantalla y el bloque de venta rapida (que tiene su propia lista). */
  private refrescarTodo(): void {
    this.cargarDatos();
    this.ventaRapida?.refrescar();
  }

  /* ============================================================
   *  MODALES
   * ============================================================ */
  abrirModal(modal: string) {
    // Siempre se recarga para trabajar con stock y ventas actuales
    this.cargarDatos();
    if (modal === 'pos') {
      this.mostrarModalPOS = true;
      this.carrito = [];
      this.totalCarrito = 0;
      this.busqueda = '';
    }
    if (modal === 'inventario') this.mostrarModalInventario = true;
    if (modal === 'reportes') this.mostrarModalReportes = true;
    if (modal === 'arqueo') this.mostrarModalArqueo = true;
  }

  cerrarModales() {
    this.mostrarModalPOS = false;
    this.mostrarModalInventario = false;
    this.mostrarModalReportes = false;
    this.mostrarModalArqueo = false;
    this.reporteForm.reset({ categoria: 'todas' });
    this.arqueoForm.reset();
  }

  /* ============================================================
   *  CAJA (POS)
   * ============================================================ */
  get catalogoFiltrado(): ProductoTienda[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.catalogo;
    return this.catalogo.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
  }

  agregarAlCarrito(producto: ProductoTienda) {
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

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  procesarVenta() {
    if (this.carrito.length === 0 || this.procesando) return;

    this.procesando = true;
    const items = this.carrito.map(i => ({ producto_id: i.id, cantidad: i.cantidad }));

    this.ventaProductoService.venderCarrito(items).subscribe({
      next: r => {
        this.procesando = false;
        this.toastr.success(
          `TKT-${String(r.venta_id).padStart(3, '0')} · Bs ${r.total}`,
          'Venta registrada'
        );
        this.cerrarModales();
        this.refrescarTodo();
      },
      error: e => {
        this.procesando = false;
        this.toastr.error(e.error?.error ?? 'No se pudo registrar la venta.', 'Error');
        // El stock pudo cambiar mientras armabas el ticket
        this.cargarDatos();
      }
    });
  }

  /* ============================================================
   *  INVENTARIO: AJUSTAR / REPONER
   * ============================================================ */
  abrirAjuste(producto: ProductoTienda, modo: ModoAjuste) {
    this.productoAjuste = producto;
    this.ajusteForm.reset({ modo, cantidad: modo === 'fijar' ? producto.stock : null });
    this.mostrarModalAjuste = true;
  }

  cerrarAjuste() {
    this.mostrarModalAjuste = false;
    this.productoAjuste = null;
    this.guardandoAjuste = false;
  }

  guardarAjuste() {
    if (!this.productoAjuste || this.guardandoAjuste) return;
    if (this.ajusteForm.invalid) {
      this.ajusteForm.get('cantidad')?.markAsTouched();
      return;
    }

    const { modo, cantidad } = this.ajusteForm.value as { modo: ModoAjuste; cantidad: number };
    const n = Number(cantidad);
    if (!Number.isInteger(n) || n < 0 || (modo === 'agregar' && n < 1)) {
      this.toastr.warning(
        modo === 'agregar' ? 'Ingresa un número entero mayor a 0.' : 'Ingresa un número entero igual o mayor a 0.',
        'Cantidad inválida'
      );
      return;
    }

    this.guardandoAjuste = true;
    const cambio = modo === 'agregar' ? { incremento: n } : { stock: n };
    this.productoService.ajustarStock(this.productoAjuste.id, cambio).subscribe({
      next: r => {
        this.toastr.success(
          `${r.producto}: ${r.stock_anterior} → ${r.stock_actual} unidades.`,
          'Stock actualizado'
        );
        this.cerrarAjuste();
        this.refrescarTodo();
      },
      error: e => {
        this.guardandoAjuste = false;
        this.toastr.error(e.error?.error ?? 'No se pudo actualizar el stock.', 'Error');
      }
    });
  }

  /* ============================================================
   *  REPORTE EXCEL
   * ============================================================ */
  exportarAExcel() {
    if (this.reporteForm.invalid) {
      Object.keys(this.reporteForm.controls).forEach(key => this.reporteForm.get(key)?.markAsTouched());
      return;
    }

    const { categoria, fechaInicio, fechaFin } = this.reporteForm.value as {
      categoria: string; fechaInicio: string; fechaFin: string;
    };

    if (fechaInicio > this.fechaMaximaVisible || fechaFin > this.fechaMaximaVisible) {
      this.toastr.error('No puedes exportar fechas futuras.', 'Fecha inválida');
      return;
    }
    if (fechaInicio > fechaFin) {
      this.toastr.error('La fecha "Desde" no puede ser mayor que "Hasta".', 'Rango inválido');
      return;
    }

    const ventas = new Map(this.ventasApi.map(v => [v.id, v] as [number, any]));
    const productos = new Map(this.catalogo.map(p => [p.id, p] as [number, ProductoTienda]));

    const filas = this.detallesApi
      .map(d => {
        const venta = ventas.get(d.venta);
        const producto = productos.get(d.producto);
        return venta ? {
          Fecha: venta.fecha as string,
          Hora: venta.hora ?? '',
          Ticket: `TKT-${String(venta.id).padStart(3, '0')}`,
          Producto: producto?.nombre ?? `Producto #${d.producto}`,
          Categoría: producto?.categoria ?? '',
          Cantidad: Number(d.cantidad),
          'Subtotal (Bs)': Number(d.subtotal),
          'Método de pago': venta.metodo_pago ?? ''
        } : null;
      })
      .filter((f): f is NonNullable<typeof f> =>
        f !== null &&
        f.Fecha >= fechaInicio && f.Fecha <= fechaFin &&
        (categoria === 'todas' || f.Categoría === categoria)
      )
      .sort((a, b) => a.Fecha.localeCompare(b.Fecha) || a.Ticket.localeCompare(b.Ticket));

    if (filas.length === 0) {
      this.toastr.info('No hay ventas con esos filtros.', 'Sin datos');
      return;
    }

    const totalBs = filas.reduce((acc, f) => acc + f['Subtotal (Bs)'], 0);
    const hoja = XLSX.utils.json_to_sheet([
      ...filas,
      { Fecha: '', Hora: '', Ticket: '', Producto: 'TOTAL', Categoría: '', Cantidad: filas.reduce((a, f) => a + f.Cantidad, 0), 'Subtotal (Bs)': totalBs, 'Método de pago': '' }
    ]);
    hoja['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 28 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 16 }];
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Ventas_Tienda');
    XLSX.writeFile(libro, `Reporte_Ventas_${fechaInicio}_al_${fechaFin}.xlsx`);

    this.toastr.success(`${filas.length} registro(s) exportados.`, 'Reporte generado');
    this.cerrarModales();
  }

  /* ============================================================
   *  ARQUEO DE CAJA
   * ============================================================ */
  get diferenciaArqueo(): number | null {
    const fisico = this.arqueoForm?.get('montoFisico')?.value;
    if (fisico === '' || fisico === null || fisico === undefined) return null;
    return Math.round((Number(fisico) - this.ventasTurno) * 100) / 100;
  }

  procesarArqueo() {
    if (this.arqueoForm.invalid) {
      this.arqueoForm.get('montoFisico')?.markAsTouched();
      return;
    }

    const fisico = Number(this.arqueoForm.value.montoFisico);
    const dif = this.diferenciaArqueo ?? 0;
    const nota = dif === 0
      ? 'Cuadre exacto'
      : (dif > 0 ? `Sobrante: Bs ${dif}` : `Faltante: Bs ${Math.abs(dif)}`);

    this.cierreCajaService.registrarCierre({
      total_ingresos: fisico,
      observaciones: `Cierre de caja Tienda. Ventas en efectivo del turno: Bs ${this.ventasTurno.toFixed(2)}. ${nota}`
    }).subscribe({
      next: () => {
        this.toastr.success(`Arqueo registrado por Bs ${fisico}. ${nota}.`, 'Caja cerrada');
        this.cerrarModales();
      },
      error: () => {
        this.toastr.error('No se pudo guardar el cierre en el servidor.', 'Error');
      }
    });
  }
}
