import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ClientesService } from '../../../../../service/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-list-clientes',
  imports: [HeaderComponent, BarraLateralComponent,FormsModule, CommonModule,HttpClientModule],
  templateUrl: './list-clientes.component.html',
  styleUrl: './list-clientes.component.css'
})
export class ListClientesComponent  implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;

  cliente = {
    id_cliente: '',
    direccion: '',
    dni: '',
    email:'',
    estado:'',
    fecha_registro:'',
    nombre:'',
    ruc:'',
    telefono:'',
  };

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
  private clienteService: ClientesService,
  private router: Router,
  private route: ActivatedRoute,
  private dialog: MatDialog  // <-- inyecta MatDialog

) {}


  ngOnInit() {
    this.listarClientes();

    // Detectar cambios de ruta para abrir modal si estamos en /clientes/add
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (url.endsWith('/add-clientes')) {
          this.abrirModalNuevoCliente();
        }
      });

    // También al iniciar (por si ya estamos en /clientes/add)
    if (this.router.url.endsWith('/add-clientes')) {
      this.abrirModalNuevoCliente();
    }
  }

  abrirModalNuevoCliente() {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '1200px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Volver a la lista sin /add al cerrar modal
      this.router.navigate(['/clientes']);
      if (result === 'guardado') {
        this.listarClientes();
      }
    });
  }


  listarClientes() {
    this.clienteService.listarClientes().subscribe({
      next: (data: any) => {
        console.log('Clientes cargados:', data);
        this.clientes = data || [];
        this.buscarCliente();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
        console.error(err);
      }
    });
  }


  buscarCliente() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_cliente?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
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

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }





  eliminarMetodo(id: number) {
      if (!id) {
    Swal.fire("Error", "ID de método no válido", "error");
    return;
  }
    Swal.fire({
      title: "¿Eliminar?",
      text: "No podrás deshacer esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        this.clienteService.eliminarCliente(id).subscribe({
          next: () => {
            Swal.fire("Eliminado", "El método fue eliminado", "success");
            this.listarClientes();
          },
          error: (err) => {
            Swal.fire("Error", "No se pudo eliminar", "error");
            console.log(err);
          }
        });
      }
    });
  }

 navegarYMostrarModal() {
    this.router.navigate(['admin/add-clientes']);
  }

}
