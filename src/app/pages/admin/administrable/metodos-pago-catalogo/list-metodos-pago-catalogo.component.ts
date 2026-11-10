import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import { MetodoPagoCatalogo, MetodoPagoCatalogoService, TIPOS_METODO_PAGO } from '../../../../service/metodo-pago-catalogo.service';

@Component({
  selector: 'app-list-metodos-pago-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent, PaginarPipe],
  templateUrl: './list-metodos-pago-catalogo.component.html',
  styleUrls: ['./list-metodos-pago-catalogo.component.css']
})
export class ListMetodosPagoCatalogoComponent implements OnInit {
  metodos: MetodoPagoCatalogo[] = [];
  filtrados: MetodoPagoCatalogo[] = [];
  filtro = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  readonly tipos = TIPOS_METODO_PAGO;

  mostrarModal = false;
  guardando = false;
  form: { idCatalogo: number; nombre: string; tipo: string; requiereDetalle: boolean } = this.formVacio();
  errores: Record<string, string> = {};
  aviso = '';

  constructor(private svc: MetodoPagoCatalogoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private formVacio() {
    return { idCatalogo: 0, nombre: '', tipo: 'DIGITAL', requiereDetalle: false };
  }

  cargar(): void {
    this.cargando = true;
    this.svc.listar().subscribe({
      next: data => {
        this.metodos = (Array.isArray(data) ? data : []).filter(m => m.estado !== 0);
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo cargar el catálogo de métodos de pago', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t
      ? this.metodos.filter(m => m.nombre.toLowerCase().includes(t) || this.etiquetaTipo(m.tipo).toLowerCase().includes(t))
      : [...this.metodos];
  }

  get pidenDato(): number {
    return this.metodos.filter(m => m.requiereDetalle).length;
  }

  etiquetaTipo(tipo: string): string {
    return this.tipos.find(t => t.valor === tipo)?.etiqueta || tipo || 'Otro';
  }

  iniciales(n: string): string {
    return (n || '?').slice(0, 2).toUpperCase();
  }

  abrirModal(m?: MetodoPagoCatalogo): void {
    this.errores = {};
    this.aviso = '';
    this.form = m
      ? { idCatalogo: m.idCatalogo, nombre: m.nombre, tipo: m.tipo || 'OTRO', requiereDetalle: !!m.requiereDetalle }
      : this.formVacio();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    this.errores = {};
    this.aviso = '';
    const nombre = this.form.nombre.trim();
    if (!nombre) {
      this.errores['nombre'] = 'El nombre es obligatorio.';
      return;
    }

    const edita = this.form.idCatalogo > 0;
    const cuerpo: Partial<MetodoPagoCatalogo> = {
      ...(edita ? { idCatalogo: this.form.idCatalogo } : {}),
      nombre,
      tipo: this.form.tipo,
      requiereDetalle: this.form.requiereDetalle
    };

    this.guardando = true;
    const pet$ = edita ? this.svc.editar(cuerpo) : this.svc.registrar(cuerpo);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        Swal.fire('Éxito', edita ? 'Método de pago actualizado' : 'Método de pago agregado al catálogo', 'success');
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpoErr = err.error;
        const msg: string = (typeof cuerpoErr === 'string' ? cuerpoErr : cuerpoErr?.message || cuerpoErr?.Detalle) || 'No se pudo guardar el método de pago';
        const campos = cuerpoErr?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
          this.aviso = '';
        } else if (err.status === 409) {
          this.errores['nombre'] = msg;
        } else {
          this.aviso = msg;
        }
      }
    });
  }

  eliminar(m: MetodoPagoCatalogo): void {
    Swal.fire({
      title: `¿Eliminar "${m.nombre}"?`,
      text: 'Se quitará del catálogo. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(m.idCatalogo).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Método de pago eliminado del catálogo', 'success');
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          const cuerpo = err.error;
          const msg = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.Detalle) || 'No se pudo eliminar';
          // 409: alguna sucursal ya lo usa, no es un error técnico
          Swal.fire({ icon: err.status === 409 ? 'info' : 'error', title: err.status === 409 ? 'No se puede eliminar' : 'Error', text: msg });
        }
      });
    });
  }
}
