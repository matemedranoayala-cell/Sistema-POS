import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BitacoraService } from '../../../../services/bitacora.service';

@Component({
  selector: 'app-modal-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-crear-producto.component.html'
})
export class ModalCrearProductoComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() productoCreado = new EventEmitter<void>();

  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private bitacoraService = inject(BitacoraService);

  guardando = false;

  producto = {
    nombre: '',
    categoria: 'Bebidas y Energizantes',
    precio: null as number | null,
    stock: null as number | null,
    sku: ''
  };

  generarSkuAutomatico(): string {
    const prefijo = this.producto.categoria.slice(0, 3).toUpperCase();
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    return `${prefijo}-${aleatorio}`;
  }

  guardarProducto() {
    const nombreLimpio = this.producto.nombre.trim();
    const precioNum = Number(this.producto.precio);
    const stockNum = Number(this.producto.stock);

    if (!nombreLimpio || !this.producto.categoria || isNaN(precioNum) || precioNum <= 0) {
      this.toastr.warning('Completa el nombre, categoría y un precio mayor a 0.', 'Datos Incompletos');
      return;
    }

    if (this.producto.stock === null || isNaN(stockNum) || stockNum < 0) {
      this.toastr.warning('Ingresa un stock inicial válido (0 o más).', 'Stock Inválido');
      return;
    }

    this.guardando = true;
    const skuFinal = this.producto.sku.trim() ? this.producto.sku.trim().toUpperCase() : this.generarSkuAutomatico();

    const payload = {
      nombre: nombreLimpio,
      categoria: this.producto.categoria,
      precio: precioNum,
      stock: Math.floor(stockNum),
      sku: skuFinal
    };

    this.http.post('http://127.0.0.1:8000/api/productos/', payload).subscribe({
      next: () => {
        this.guardando = false;
        this.bitacoraService.registrarEvento(
          'Creacion de Producto',
          'Tienda POS',
          `Nuevo producto registrado: ${payload.nombre} (${payload.categoria}) - Bs ${payload.precio} - Stock inicial: ${payload.stock}`
        ).subscribe();

        this.toastr.success(`${payload.nombre} agregado al catálogo.`, 'Producto Creado');
        this.productoCreado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        this.guardando = false;
        const msg = err?.error?.error ?? 'No se pudo registrar el producto en el servidor.';
        this.toastr.error(msg, 'Error');
      }
    });
  }
}
