import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { CategoriasService } from '../../../../../service/categorias.service';
import { ProductosService } from '../../../../../service/productos.service';

@Component({
  selector: 'app-add-ventas',
  standalone: true,
  imports: [BarraLateralComponent, HeaderComponent, CommonModule, RouterModule],
  templateUrl: './add-ventas.component.html',
  styleUrls: ['./add-ventas.component.css']
})
export class AddVentasComponent implements OnInit {
  categorias: any[] = [];
  productos: any[] = [];
  productosAgregados: any[] = [];

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.categoriasService.listarCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.listarProductos();
  }

  listarProductos() {
    this.productosService.listarProductos().subscribe({
      next: (data: any) => {
        this.productos = data || [];
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
        console.error(err);
      }
    });
  }

  seleccionarCategoria(categoria: any): void {
    if (categoria && categoria.idcategoria) {
      this.productosService.listarProductosPorCategoria(categoria.idcategoria).subscribe({
        next: (data: any) => {
          this.productos = data || [];
        },
        error: (err) => {
          Swal.fire("Error", "No se pudieron cargar los productos de esta categoría", "error");
          console.error(err);
        }
      });
    }
  }

  agregarProducto(producto: any): void {
    const existente = this.productosAgregados.find(p => p.idproducto === producto.idproducto);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.productosAgregados.push({
        ...producto,
        cantidad: 1,
        descuento: 0
      });
    }
  }

  get totalCompra(): number {
    return this.productosAgregados.reduce((total, item) =>
      total + item.cantidad * item.costo_venta * (1 - item.descuento / 100), 0
    );
  }
}
