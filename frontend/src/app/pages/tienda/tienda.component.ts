import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {
  fechaActual = 'Sunday, September 27, 2026';
  usuarioActual = 'Encargado de Tienda';
  fechaMaximaVisible = ''; // Para bloquear fechas futuras

  ventasRecientes = [
    { ticket: 'TKT-089', cliente: 'Camila Vaca', items: 'Agua Mineral (x2), Barra Proteína', total: 35, hora: '19:45', estado: 'Pagado', color: 'green' },
    { ticket: 'TKT-090', cliente: 'Javier Morales', items: 'Vendas de Boxeo (Rojas)', total: 80, hora: '19:50', estado: 'Pagado', color: 'green' },
    { ticket: 'TKT-091', cliente: 'Venta Anónima', items: 'Bebida Isotónica', total: 15, hora: '20:10', estado: 'Pendiente', color: 'orange' }
  ];

  inventarioCritico = [
    { producto: 'Agua Mineral 500ml', stockActual: 5, minimo: 20, estado: 'Crítico' },
    { producto: 'Pre-Entreno C4', stockActual: 2, minimo: 5, estado: 'Crítico' }
  ];

  catalogo = [
    { id: 1, nombre: 'Agua Mineral 500ml', precio: 5, stock: 5, categoria: 'Bebidas', color: 'blue' },
    { id: 2, nombre: 'Gatorade (Azul)', precio: 15, stock: 24, categoria: 'Bebidas', color: 'blue' },
    { id: 3, nombre: 'Barra de Proteína', precio: 12, stock: 15, categoria: 'Snacks', color: 'orange' },
    { id: 4, nombre: 'Pre-Entreno C4', precio: 10, stock: 2, categoria: 'Suplementos', color: 'red' },
    { id: 5, nombre: 'Vendas Boxeo 5m', precio: 80, stock: 8, categoria: 'Equipamiento', color: 'green' }
  ];

  mostrarModalPOS = false;
  mostrarModalInventario = false;
  mostrarModalReportes = false;
  mostrarModalArqueo = false;

  reporteForm!: FormGroup;
  arqueoForm!: FormGroup;

  carrito: any[] = [];
  totalCarrito = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Calculamos la fecha actual en formato YYYY-MM-DD para bloquear el calendario al futuro
    const hoy = new Date();
    this.fechaMaximaVisible = hoy.toISOString().split('T')[0];

    this.reporteForm = this.fb.group({
      categoria: ['todas'],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });

    this.arqueoForm = this.fb.group({
      montoFisico: ['', [Validators.required, Validators.min(0)]]
    });
  }

  abrirModal(modal: string) {
    if (modal === 'pos') { this.mostrarModalPOS = true; this.carrito = []; this.totalCarrito = 0; }
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

  /* --- LÓGICA DE CAJA (POS) --- */
  agregarAlCarrito(producto: any) {
    const itemExistente = this.carrito.find(item => item.id === producto.id);
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
    if (this.carrito.length === 0) return;

    const nombresItems = this.carrito.map(i => `${i.nombre} (x${i.cantidad})`).join(', ');
    const nuevaVenta = {
      ticket: `TKT-09${this.ventasRecientes.length + 2}`,
      cliente: 'Venta Anónima',
      items: nombresItems,
      total: this.totalCarrito,
      hora: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Pagado',
      color: 'green'
    };

    // Inyecta la venta visualmente en la tabla de últimas transacciones
    this.ventasRecientes.unshift(nuevaVenta);
    this.cerrarModales();
  }

  /* --- LÓGICA DE EXPORTACIÓN Y ARQUEO --- */
  exportarAExcel() {
    if (this.reporteForm.valid) {
      const filtros = this.reporteForm.value;
      console.log('Generando archivo Excel con filtros:', filtros);
      alert('Descargando Reporte_Ventas.xlsx...');
      this.cerrarModales();
    } else {
      Object.keys(this.reporteForm.controls).forEach(key => this.reporteForm.get(key)?.markAsTouched());
    }
  }

  procesarArqueo() {
    if (this.arqueoForm.valid) {
      alert('Caja cerrada con éxito.');
      this.cerrarModales();
    } else {
      this.arqueoForm.get('montoFisico')?.markAsTouched();
    }
  }
}
