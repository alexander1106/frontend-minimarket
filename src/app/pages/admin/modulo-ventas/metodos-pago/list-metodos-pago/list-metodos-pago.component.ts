<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { MetodoPagoService } from '../../../../../service/metodo-pago.service';


@Component({
  selector: 'app-list-metodos-pago',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-metodos-pago.component.html',
  styleUrls: ['./list-metodos-pago.component.css']
})
export class ListMetodosPagoComponent implements OnInit {
  metodos: any[] = [];
  metodosFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;

  metodo = {
    id_metodo: '',
    nombre: '',
    descripcion: ''
  };

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
  private metodoPagoService: MetodoPagoService,
  private router: Router,
  private route: ActivatedRoute
) {}

ngOnInit(): void {
  this.listarMetodos();

  this.route.url.subscribe(urlSegments => {
    const path = urlSegments.map(s => s.path).join('/');

    if (path === 'admin/add-metodos-pago') {
      this.verModal();
    } else if (path.startsWith('admin/edit-metodos-pago')) {
      const id = this.route.snapshot.params['id'];
      if (id) {
        this.cargarMetodoParaEditar(+id); // convierte a número
      }
    }
  });
}
  navegarYMostrarModal() {
  this.router.navigate(['/admin/add-metodos-pago']);
}



  listarMetodos() {
    this.metodoPagoService.listarMetodosPago().subscribe({
      next: (data: any) => {
        console.log('Métodos cargados:', data);
        this.metodos = data || [];
        this.buscarMetodosPago();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los métodos", "error");
        console.error(err);
      }
    });
  }

  buscarMetodosPago() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.metodos;
    if (filtro !== '') {
      coincidencias = this.metodos.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    this.metodosFiltrados = coincidencias.slice(
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

  actualizarPaginaFiltrada() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.metodos;
    if (filtro !== '') {
      coincidencias = this.metodos.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    this.metodosFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.metodos;
    if (filtro !== '') {
      coincidencias = this.metodos.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

  verModal() {
    this.metodo = { id_metodo: '', nombre: '', descripcion: '' };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
      this.router.navigate(['/admin/metodos-pago']); // vuelve a la ruta base

  }

formSubmit() {
  if (this.metodo.id_metodo) {
    // Editar
    this.metodoPagoService.editarMetodoPago(this.metodo).subscribe({
      next: () => {
        Swal.fire("Actualizado", "Método actualizado correctamente", "success");
        this.cerrarModal();
        this.listarMetodos();
      },
      error: () => {
        Swal.fire("Error", "No se pudo actualizar el método", "error");
      }
    });
  } else {
    // Crear
    this.metodoPagoService.registrarMetodoPago(this.metodo).subscribe({
      next: () => {
        Swal.fire("Guardado", "Método registrado exitosamente", "success");
        this.cerrarModal();
        this.listarMetodos();
      },
      error: (error) => {
        if (error.status === 409) {
          Swal.fire("Duplicado", error.error || "Ya existe un método de pago con ese nombre", "warning");
        } else {
          console.error("Error al registrar método de pago:", error);
          Swal.fire("Error", "No se pudo guardar el método", "error");
        }
      }
    });
  }
}

cargarMetodoParaEditar(id: number) {
  this.metodoPagoService.buscarMetodoPagoId(id).subscribe({
    next: (data: any) => {
      this.metodo = data;
      this.mostrarModal = true;
    },
    error: () => {
      Swal.fire("Error", "No se pudo cargar el método", "error");
    }
  });
}

  editarMetodo(id: number) {
      this.router.navigate(['/admin/edit-metodos-pago', id]);

    this.metodoPagoService.buscarMetodoPagoId(id).subscribe({
      next: (data: any) => {
        this.metodo = data;
        this.mostrarModal = true;
      },
      error: () => {
        Swal.fire("Error", "No se pudo cargar el método", "error");
      }
    });
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
        this.metodoPagoService.eliminarMetodoPago(id).subscribe({
          next: () => {
            Swal.fire("Eliminado", "El método fue eliminado", "success");
            this.listarMetodos();
          },
          error: (err) => {
            Swal.fire("Error", "No se pudo eliminar", "error");
            console.log(err);
          }
        });
      }
    });
  }
}
=======
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { MetodoPagoService } from '../../../../../service/metodo-pago.service';

@Component({
  selector: 'app-list-metodos-pago',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-metodos-pago.component.html',
  styleUrls: ['./list-metodos-pago.component.css']
})
export class ListMetodosPagoComponent implements OnInit {
  metodos: any[] = [];
  metodosFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  modoModal: 'ver' | 'editar' | 'agregar' = 'agregar';

  metodo = {
    id_metodo: '',
    nombre: '',
  };

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private metodoPagoService: MetodoPagoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.listarMetodos();

    this.route.url.subscribe(() => {
      const id = this.route.snapshot.params['id'];
      const fullUrl = this.router.url;

      if (fullUrl.includes('/admin/add-metodos-pago')) {
        this.verModalAgregar();
      } else if (fullUrl.includes('/admin/edit-metodos-pago') && id) {
        this.verModalEditar(+id);
      } else if (fullUrl.includes('/admin/ver-metodos-pago') && id) {
        this.verModalVer(+id);
      }
    });
  }

  navegarYMostrarModal() {
    this.router.navigate(['/admin/add-metodos-pago']);
  }

  listarMetodos() {
    this.metodoPagoService.listarMetodosPago().subscribe({
      next: (data: any) => {
        this.metodos = data || [];
        this.actualizarFiltradoYPagina();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los métodos", "error");
        console.error(err);
      }
    });
  }

  buscarMetodosPago(): any[] {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    return this.metodos.filter(m =>
      (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
      (m?.id_metodo?.toString()?.includes(filtro) || false)
    );
  }

  paginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaFiltrada();
    }
  }

  actualizarFiltradoYPagina() {
    this.paginaActual = 1;
    this.actualizarPaginaFiltrada();
  }

  actualizarPaginaFiltrada() {
    const coincidencias = this.buscarMetodosPago();
    this.metodosFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.ceil(this.buscarMetodosPago().length / this.elementosPorPagina);
  }

  verModalAgregar() {
    this.modoModal = 'agregar';
    this.metodo = { id_metodo: '', nombre: '' };
    this.mostrarModal = true;
  }

  verModalEditar(id: number) {
    this.modoModal = 'editar';
    this.metodoPagoService.buscarMetodoPagoId(id).subscribe({
      next: (data: any) => {
        this.metodo = data;
        this.mostrarModal = true;
      },
      error: () => {
        Swal.fire("Error", "No se pudo cargar el método", "error");
      }
    });
  }

  verModalVer(id: number) {
    this.modoModal = 'ver';
    this.metodoPagoService.buscarMetodoPagoId(id).subscribe({
      next: (data: any) => {
        this.metodo = data;
        this.mostrarModal = true;
      },
      error: () => {
        Swal.fire("Error", "No se pudo cargar el método", "error");
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.router.navigate(['/admin/metodos-pago']);
  }

  formSubmit() {
    if (this.modoModal === 'ver') return;

    if (this.metodo.id_metodo) {
      this.metodoPagoService.editarMetodoPago(this.metodo).subscribe({
        next: () => {
          Swal.fire("Actualizado", "Método actualizado correctamente", "success");
          this.cerrarModal();
          this.listarMetodos();
        },
        error: () => {
          Swal.fire("Error", "No se pudo actualizar el método", "error");
        }
      });
    } else {
      this.metodoPagoService.registrarMetodoPago(this.metodo).subscribe({
        next: () => {
          Swal.fire("Guardado", "Método registrado exitosamente", "success");
          this.cerrarModal();
          this.listarMetodos();
        },
        error: (error) => {
          if (error.status === 400) {
            Swal.fire("Duplicado", error.error || "Ya existe un método de pago con ese nombre", "warning");
          } else {
            console.error("Error al registrar método de pago:", error);
            Swal.fire("Error", "No se pudo guardar el método", "error");
          }
        }
      });
    }
  }

  editarMetodo(id: number) {
    this.router.navigate(['/admin/edit-metodos-pago', id]);
  }

  verMetodo(id: number) {
    this.router.navigate(['/admin/ver-metodos-pago', id]);
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
        this.metodoPagoService.eliminarMetodoPago(id).subscribe({
          next: () => {
            Swal.fire("Eliminado", "El método fue eliminado", "success");
            this.listarMetodos();
          },
          error: (err) => {
            Swal.fire("Error", "No se pudo eliminar", "error");
            console.log(err);
          }
        });
      }
    });
  }
}
>>>>>>> c9344cccc07f00d5cfac9bc27d228d1e08befd73
