import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ComprasService } from '../../../../../service/compras.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCompraComponent } from '../add-compra/add-compra.component';

@Component({
  selector: 'app-list-compras',
  standalone: true,
  imports: [HeaderComponent, RouterModule, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-compras.component.html',
  styleUrls: ['./list-compras.component.css']
})
export class ListComprasComponent implements OnInit {
  compras: any[] = [];
  comprasFiltradas: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private comprasService: ComprasService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.listarCompras();

    const url = this.router.url;

    // Modal de agregar
    if (url.endsWith('/add-compras')) {
      this.abrirModalNuevaCompra();
    }

    // Modal de ver
    const matchView = url.match(/view-compras\/(\d+)/);
    if (matchView) {
      const idCompra = Number(matchView[1]);
      this.abrirModalVerCompraPorId(idCompra);
    }
  }

  listarCompras() {
    this.comprasService.listarCompras().subscribe({
      next: (data: any) => {
        this.compras = data || [];
        this.buscarCompra();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar las compras", "error");
        console.error(err);
      }
    });
  }

  buscarCompra() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.compras;
    if (filtro !== '') {
      coincidencias = this.compras.filter(c =>
        (c?.idCompra?.toString()?.includes(filtro)  || false) ||
        (c?.proveedor?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (c?.descripcion?.toLowerCase()?.includes(filtro) || false)
      )
    }

    this.comprasFiltradas = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaFiltrada();
    }
  }

  paginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }

  actualizarPaginaFiltrada() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.compras;
    if (filtro !== '') {
      coincidencias = this.compras.filter(c =>
        (c?.idCompra?.toString()?.includes(filtro) || false) ||
        (c?.proveedor?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (c?.descripcion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    this.comprasFiltradas = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.compras;
    if (filtro !== '') {
      coincidencias = this.compras.filter(c =>
        (c?.idCompra?.toString()?.includes(filtro) || false) ||
        (c?.proveedor?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (c?.descripcion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

  navegarYVerCompra(idCompra: number) {
    this.router.navigate(['/admin/view-compras', idCompra]);
  }

  abrirModalVerCompraPorId(id: number) {
    this.comprasService.obtenerCompraConDetalles(id).subscribe({
      next: (compra) => {
        const dialogRef = this.dialog.open(AddCompraComponent, {
          width: '1200px',
          disableClose: true,
          data: { compra, modo: 'ver' }
        });

        dialogRef.afterClosed().subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/admin/list-compras']);
          }, 0);
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la compra', 'error');
        this.router.navigate(['/admin/list-compras']);
      }
    });
  }

abrirModalNuevaCompra() {
  const dialogRef = this.dialog.open(AddCompraComponent, {
    width: 'calc(100vw - 285px)', // 15px más de margen a cada lado
    height: 'calc(100vh - 90px)', // 15px más de margen arriba y abajo
    maxWidth: 'calc(100vw - 30px)', // Margen total de 30px (15px cada lado)
    disableClose: true,
    panelClass: 'custom-dialog',
    position: {
      top: '65px', // 5px más que la altura del header
      left: '270px' // 10px más que el ancho de la barra lateral
    },
    data: { /* opcional */ }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'guardado') {
      this.listarCompras();
    }
    setTimeout(() => {
      this.router.navigate(['/admin/list-compras']);
    }, 0);
  });
}
  navegarYMostrarModal() {
    this.router.navigate(['admin/add-compras']);
  }

  eliminarCompra(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la compra permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.comprasService.eliminarCompra(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminada',
              text: 'La compra ha sido eliminada',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la compra', 'error');
            console.error(err);
          }
        });
      }
    });
  }
}