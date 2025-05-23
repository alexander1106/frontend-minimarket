import { Component, OnInit } from '@angular/core';
import { BarraLateralComponent } from "../../../../components/barra-lateral/barra-lateral.component";
import { HeaderComponent } from "../../../../components/header/header.component";
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriasService } from '../../../../service/categorias.service';

@Component({
  selector: 'app-list-categorias',
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-categorias.component.html',
  styleUrl: './list-categorias.component.css'
})
export class ListCategoriasComponent implements OnInit {
  categorias: any []= [];
  categoriasFiltrados: any[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;

  categoria = {
    idcategoria: '',
    nombre: '',
    imagen: '',
  };

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  imagenFile: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.listarCategorias();

    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(s => s.path).join('/');

      if (path === 'admin/add-categorias') {
        this.verModal();
      } else if (path.startsWith('admin/update-categorias')) {
        const id = this.route.snapshot.params['id'];
        if (id) {
          this.cargarCategoriaParaEditar(+id); // convierte a número
        }
      }
    });
  }

  navegarYMostrarModal() {
  this.verModal(); // Solo abre el modal, no navega
}


  listarCategorias() {
    this.categoriasService.listarCategorias().subscribe({
      next: (data: any) => {
        this.categorias = data || [];
        this.buscarCategorias();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar las categorias", "error");
        console.error(err);
      }
    });
  }

  buscarCategorias() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.categorias;
    if (filtro !== '') {
      coincidencias = this.categorias.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.idcategoria?.toString()?.includes(filtro) || false) ||
        (m?.imagen?.toString()?.includes(filtro) || false)
      );
    }

    this.categoriasFiltrados = coincidencias.slice(
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

    let coincidencias = this.categorias;
    if (filtro !== '') {
      coincidencias = this.categorias.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.idcategoria?.toString()?.includes(filtro) || false) ||
        (m?.imagen?.toString()?.includes(filtro) || false)
      );
    }

    this.categoriasFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.categorias;
    if (filtro !== '') {
      coincidencias = this.categorias.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.imagen?.toLowerCase()?.includes(filtro) || false) ||
        (m?.idcategoria?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

  verModal() {
    this.categoria = { idcategoria: '', nombre: '' , imagen: ''};
    this.imagenFile = null;
    this.imagenPreview = null;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.imagenFile = null;
    this.imagenPreview = null;
    this.router.navigate(['/admin/categorias']); // vuelve a la ruta base
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenFile = file;

      // Vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  formSubmit() {
    const formData = new FormData();
    formData.append('nombre', this.categoria.nombre);

    if (this.categoria.idcategoria) {
      formData.append('idcategoria', this.categoria.idcategoria);
    }

    if (this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    }

    if (this.categoria.idcategoria) {
      // Editar (PUT)
      this.categoriasService.editarcategoria(formData).subscribe({
        next: () => {
          Swal.fire("Actualizado", "Categoria actualizada correctamente", "success");
          this.cerrarModal();
          this.listarCategorias();
        },
        error: () => {
          Swal.fire("Error", "No se pudo actualizar la categoria", "error");
        }
      });
    } else {
      // Crear (POST)
      this.categoriasService.registrarCategorias(formData).subscribe({
        next: () => {
          Swal.fire("Guardado", "Categoria registrada exitosamente", "success");
          this.cerrarModal();
          this.listarCategorias();
        },
        error: (error) => {
          if (error.status === 409) {
            Swal.fire("Duplicado", error.error || "Ya existe una categoria con ese nombre", "warning");
          } else {
            Swal.fire("Error", "No se pudo guardar la categoria", "error");
          }
        }
      });
    }
  }

  cargarCategoriaParaEditar(id: number) {
    this.categoriasService.buscarCategoriaId(id).subscribe({
      next: (data: any) => {
        this.categoria = data;
        this.imagenFile = null;
        this.imagenPreview = null;
        this.mostrarModal = true;
      },
      error: () => {
        Swal.fire("Error", "No se pudo cargar la categoria", "error");
      }
    });
  }

  editarCategoria(id: number) {
  this.cargarCategoriaParaEditar(id);
}

  eliminarCategoria(id: number) {
    if (!id) {
      Swal.fire("Error", "ID de categoria no válido", "error");
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
        this.categoriasService.eliminarcategoria(id).subscribe({
          next: () => {
            Swal.fire("Eliminado", "La categoría fue eliminado", "success");
            this.listarCategorias();
          },
          error: (err) => {
            Swal.fire("Error", "No se pudo eliminar", "error");
          }
        });
      }
    });
  }
}
