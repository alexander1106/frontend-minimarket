import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { MatDialog } from '@angular/material/dialog';
import { AddProveedorComponent } from '../add-proveedor/add-proveedor.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-list-proveedores',
  standalone: true,
  imports: [HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-proveedores.component.html',
  styleUrl: './list-proveedores.component.css'
})
export class ListProveedoresComponent implements OnInit {
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private proveedorService: ProveedoresService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.listarProveedores();

    this.router.events  
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (url.includes('add-proveedores') || url.includes('edit-proveedores')) {
          const id = this.route.snapshot.params['id'];
          this.abrirModalProveedor(url.includes('edit-proveedores') ? id : null);
        }
      });

    if (this.router.url.includes('add-proveedores') || this.router.url.includes('edit-proveedores')) {
      const id = this.route.snapshot.params['id'];
      this.abrirModalProveedor(this.router.url.includes('edit-proveedores') ? id : null);
    }
  }

  abrirModalProveedor(id: number | null = null) {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '800px',
      disableClose: true,
      data: id ? { idProveedor: id } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/admin/list-proveedores']);
      if (result === 'guardado') {
        this.listarProveedores();
      }
    });
  }

  listarProveedores() {
    this.proveedorService.buscarTodos().subscribe({
      next: (data: any) => {
        this.proveedores = data || [];
        this.buscarProveedor();
      },
      error: (error) => {
        Swal.fire("Error", "No se pudieron cargar los proveedores", "error");
        console.error(error);
      }
    });
  }

  buscarProveedor() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;
    this.actualizarPaginaFiltrada();
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

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toString()?.includes(filtro) || false) ||
        (p?.regimen?.toLowerCase()?.includes(filtro) || false) ||
        (p?.telefono?.toString()?.includes(filtro) || false) ||
        (p?.gmail?.toLowerCase()?.includes(filtro) || false) ||
        (p?.direccion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    this.proveedoresFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toString()?.includes(filtro) || false) ||
        (p?.regimen?.toLowerCase()?.includes(filtro) || false) ||
        (p?.telefono?.toString()?.includes(filtro) || false) ||
        (p?.gmail?.toLowerCase()?.includes(filtro) || false) ||
        (p?.direccion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

  editarProveedor(id: number) {
    this.router.navigate([`/admin/edit-proveedores/${id}`]);
  }

  eliminarProveedor(id: number) {
    Swal.fire({
      title: "¿Eliminar proveedor?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        this.proveedorService.eliminar(id).subscribe({
          next: () => {
            Swal.fire("Eliminado", "El proveedor fue eliminado correctamente", "success");
            this.listarProveedores();
          },
          error: (error) => {
            Swal.fire("Error", "No se pudo eliminar el proveedor", "error");
            console.error(error);
          }
        });
      }
    });
  }

  navegarYMostrarModal() {
    this.router.navigate(['/admin/add-proveedores']);
  }
}