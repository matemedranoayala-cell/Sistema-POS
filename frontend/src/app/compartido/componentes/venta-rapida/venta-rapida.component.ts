import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ProductoService } from '../../../services/producto.service';
import { VentaProductoService } from '../../../services/venta-producto.service';
import { StockBajoComponent } from '../stock-bajo/stock-bajo.component';

const CATEGORIAS = ['Bebidas energizantes', 'Barras proteicas'];

@Component({
  selector: 'app-venta-rapida',
  standalone: true,
  imports: [CommonModule, StockBajoComponent],
  template: `
    <h2>Venta rápida: energizantes y barras proteicas</h2>

    <p *ngIf="mensaje" [style.color]="error ? '#ef4444' : '#10b981'">{{ mensaje }}</p>
    <p *ngIf="productos.length === 0">No hay productos en estas categorías.</p>

    <table *ngIf="productos.length > 0" style="width: 100%; text-align: left;">
      <thead>
        <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of productos">
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>Bs {{ p.precio }}</td>
          <td>{{ p.stock }}</td>
          <td>
            <button [disabled]="p.stock <= 0" (click)="vender(p)">Vender 1</button>
          </td>
        </tr>
      </tbody>
    </table>

    <app-stock-bajo></app-stock-bajo>
  `
})
export class VentaRapidaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaProductoService);

  @ViewChild(StockBajoComponent) alerta?: StockBajoComponent;

  productos: any[] = [];
  mensaje = '';
  error = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.productoService.obtenerProductos().subscribe({
      next: lista => {
        this.productos = lista
          .filter(p => CATEGORIAS.includes(p.categoria))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: () => {
        this.error = true;
        this.mensaje = 'No se pudieron cargar los productos.';
      }
    });
  }

  vender(p: any): void {
    this.ventaService.vender(p.id, 1).subscribe({
      next: r => {
        this.error = false;
        this.mensaje = `Vendido: ${r.producto} (Bs ${r.total}). Quedan ${r.stock_restante}.`;
        this.cargar();
        this.alerta?.cargar();
      },
      error: e => {
        this.error = true;
        this.mensaje = e.error?.error ?? 'No se pudo registrar la venta.';
      }
    });
  }
}
