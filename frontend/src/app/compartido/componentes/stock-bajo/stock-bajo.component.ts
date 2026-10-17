import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ProductoBajoStock, StockBajoService } from '../../../services/stock-bajo.service';

@Component({
  selector: 'app-stock-bajo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>Productos con poco stock</h3>

    <p *ngIf="cargando">Cargando productos...</p>
    <p *ngIf="error">No se pudieron cargar los productos.</p>
    <p *ngIf="!cargando && !error && productos.length === 0">
      No hay productos con poco stock.
    </p>

    <ul *ngIf="!cargando && !error">
      <li *ngFor="let producto of productos">
        {{ producto.nombre }} ({{ producto.sku }}): {{ producto.stock }} unidades
      </li>
    </ul>
  `
})
export class StockBajoComponent implements OnInit {
  private servicio = inject(StockBajoService);

  productos: ProductoBajoStock[] = [];
  cargando = true;
  error = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;
    this.servicio.obtener().subscribe({
      next: productos => {
        this.productos = productos;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
