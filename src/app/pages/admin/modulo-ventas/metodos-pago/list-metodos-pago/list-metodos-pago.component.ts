import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../../components/paginacion/paginar.pipe';
import { LoginService } from '../../../../../service/login.service';
import { MetodoPagoService } from '../../../../../service/metodo-pago.service';
import { MetodoPagoCatalogo, MetodoPagoCatalogoService, TIPOS_METODO_PAGO } from '../../../../../service/metodo-pago-catalogo.service';

@Component({
  selector: 'app-list-metodos-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent, PaginarPipe],
  templateUrl: './list-metodos-pago.component.html',
  styleUrls: ['./list-metodos-pago.component.css']
})
export class ListMetodosPagoComponent implements OnInit {
  metodos: any[] = [];
  filtrados: any[] = [];
  catalogo: MetodoPagoCatalogo[] = [];
  filtro = '';
  cargando = true;
  puedeEscribir = false;

  pagina = 1;
  porPagina = 5;

  private idSucursal: number | null = null;

  mostrarModal = false;
  guardando = false;
  editando = false;
  idMetodoPago = 0;
  idCatalogo: number | null = null;
  detalle = '';
  errores: Record<string, string> = {};
  aviso = '';

  constructor(
    private metodoPagoService: MetodoPagoService,
    private catalogoService: MetodoPagoCatalogoService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.loginService.hasRole('SUPERADMIN')) {
      this.router.navigate(['/admin/metodos-pago-catalogo']);
      return;
    }
    this.puedeEscribir = this.loginService.puedeEscribirModulo('Ventas', ['ADMIN', 'CAJERO', 'EMPRESA']);
    this.idSucursal = this.loginService.getUser()?.sucursal?.idSucursal ?? null;
    if (!this.idSucursal) {
      this.cargando = false;
      Swal.fire('Error', 'No se pudo determinar la sucursal del usuario.', 'error');
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    forkJoin({
      metodos: this.metodoPagoService.listarMetodosPagoPorSucursal(this.idSucursal as number).pipe(catchError(() => of(null))),
      catalogo: this.catalogoService.listar().pipe(catchError(() => of([])))
    }).subscribe(r => {
      this.cargando = false;
      if (r.metodos === null) {
        Swal.fire('Error', 'No se pudieron cargar los métodos de pago.', 'error');
        return;
      }
      this.metodos = Array.isArray(r.metodos) ? r.metodos : [];
      this.catalogo = (Array.isArray(r.catalogo) ? r.catalogo : []).filter(c => c.estado !== 0);
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t
      ? this.metodos.filter(m => (m.nombre || '').toLowerCase().includes(t) || (m.detalle || '').toLowerCase().includes(t))
      : [...this.metodos];
  }

  get disponibles(): MetodoPagoCatalogo[] {
    const activos = new Set(this.metodos.map(m => m.catalogo?.idCatalogo).filter(id => id != null));
    const nombres = new Set(this.metodos.map(m => String(m.nombre || '').toLowerCase()));
    return this.catalogo.filter(c => !activos.has(c.idCatalogo) && !nombres.has(c.nombre.toLowerCase()));
  }

  get catalogoElegido(): MetodoPagoCatalogo | undefined {
    return this.catalogo.find(c => c.idCatalogo === this.idCatalogo);
  }

  requiereDetalle(m: any): boolean {
    return !!m?.catalogo?.requiereDetalle;
  }

  etiquetaTipo(tipo: string | undefined): string {
    return TIPOS_METODO_PAGO.find(t => t.valor === tipo)?.etiqueta || '';
  }

  iniciales(n: string): string {
    return (n || '?').slice(0, 2).toUpperCase();
  }

  abrirActivar(): void {
    if (!this.puedeEscribir) return;
    this.editando = false;
    this.idMetodoPago = 0;
    this.idCatalogo = null;
    this.detalle = '';
    this.errores = {};
    this.aviso = '';
    this.mostrarModal = true;
  }

  abrirEditar(m: any): void {
    if (!this.puedeEscribir) return;
    this.editando = true;
    this.idMetodoPago = m.idMetodoPago;
    this.idCatalogo = m.catalogo?.idCatalogo ?? null;
    this.detalle = m.detalle || '';
    this.errores = {};
    this.aviso = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  get pideDato(): boolean {
    if (this.editando) {
      return !!this.metodos.find(m => m.idMetodoPago === this.idMetodoPago)?.catalogo?.requiereDetalle;
    }
    return !!this.catalogoElegido?.requiereDetalle;
  }

  get nombreElegido(): string {
    if (this.editando) return this.metodos.find(m => m.idMetodoPago === this.idMetodoPago)?.nombre || '';
    return this.catalogoElegido?.nombre || '';
  }

  guardar(): void {
    this.errores = {};
    this.aviso = '';
    if (!this.editando && !this.idCatalogo) {
      this.errores['idCatalogo'] = 'Elige un método de pago.';
      return;
    }
    const detalle = this.detalle.trim();
    if (this.pideDato && !detalle) {
      this.errores['detalle'] = `Indica el dato de ${this.nombreElegido} (número, cuenta o alias).`;
      return;
    }

    this.guardando = true;
    const pet$ = this.editando
      ? this.metodoPagoService.editarMetodoPago({ idMetodoPago: this.idMetodoPago, detalle: detalle || null })
      : this.metodoPagoService.activarMetodoPago(this.idSucursal as number, { idCatalogo: this.idCatalogo, detalle: detalle || null });

    pet$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        Swal.fire('Éxito', this.editando ? 'Dato actualizado' : 'Método de pago activado', 'success');
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.Detalle) || 'No se pudo guardar el método de pago';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
        } else if (err.status === 409) {
          this.errores['idCatalogo'] = msg;
        } else {
          this.aviso = msg;
        }
      }
    });
  }

  quitar(m: any): void {
    if (!this.puedeEscribir) return;
    Swal.fire({
      title: `¿Quitar ${m.nombre}?`,
      text: 'Dejará de estar disponible para cobrar en esta sucursal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.metodoPagoService.eliminarMetodoPago(m.idMetodoPago).subscribe({
        next: () => {
          Swal.fire('Quitado', 'Método de pago quitado de la sucursal', 'success');
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          let msg = 'No se pudo quitar el método de pago';
          try { const c = typeof err.error === 'string' ? JSON.parse(err.error) : err.error; msg = c?.message || c?.Detalle || msg; } catch { }
          Swal.fire({ icon: err.status === 409 ? 'info' : 'error', title: err.status === 409 ? 'No se puede quitar' : 'Error', text: msg });
        }
      });
    });
  }
}
