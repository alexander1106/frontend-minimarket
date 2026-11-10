import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import { ComprasService, leerErrorCompras } from '../../../../service/compras.service';
import { LoginService } from '../../../../service/login.service';

@Component({
  selector: 'app-list-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent, PaginarPipe],
  templateUrl: './list-compras.component.html',
  styleUrls: ['./list-compras.component.css']
})
export class ListComprasComponent implements OnInit {
  compras: any[] = [];
  filtradas: any[] = [];
  filtro = '';
  cargando = true;
  puedeEscribir = false;

  pagina = 1;
  porPagina = 5;

  detalle: { compra: any; detalles: any[] } | null = null;
  cargandoDetalle = false;

  constructor(
    private svc: ComprasService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.loginService.hasRole('SUPERADMIN')) {
      this.router.navigate(['/admin']);
      return;
    }
    this.puedeEscribir = this.loginService.puedeEscribirModulo('Compras', ['ADMIN', 'ALMACENERO', 'EMPRESA']);
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.svc.listar().subscribe({
      next: data => {
        // Sin datos el backend responde 204: llega vacío
        this.compras = (Array.isArray(data) ? data : []).filter(c => c.estado !== 0);
        this.compras.sort((a, b) => String(b.fechaCompra || '').localeCompare(String(a.fechaCompra || '')));
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: (err: any) => {
        this.cargando = false;
        this.compras = [];
        this.aplicarFiltro();
        if (err.status !== 401 && err.status !== 403) {
          Swal.fire('Error', leerErrorCompras(err).mensaje, 'error');
        }
      }
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtradas = t
      ? this.compras.filter(c =>
          String(c.idCompra).includes(t) ||
          (c.proveedor?.nombre || '').toLowerCase().includes(t) ||
          (c.proveedor?.ruc || '').includes(t) ||
          (c.descripcion || '').toLowerCase().includes(t))
      : [...this.compras];
  }

  get totalGastado(): number {
    return this.filtradas.reduce((s, c) => s + Number(c.total || 0), 0);
  }

  nueva(): void {
    this.router.navigate(['/admin/compras/nueva']);
  }

  editar(c: any): void {
    this.router.navigate(['/admin/compras/editar', c.idCompra]);
  }

  ver(c: any): void {
    this.cargandoDetalle = true;
    this.detalle = { compra: c, detalles: [] };
    this.svc.buscar(c.idCompra).subscribe({
      next: r => {
        this.cargandoDetalle = false;
        this.detalle = { compra: r.compra || c, detalles: Array.isArray(r.detalles) ? r.detalles : [] };
      },
      error: (err: any) => {
        this.cargandoDetalle = false;
        this.detalle = null;
        if (err.status === 404) {
          Swal.fire('No encontrada', leerErrorCompras(err).mensaje, 'warning');
          this.cargar();
        } else if (err.status !== 401 && err.status !== 403) {
          Swal.fire('Error', leerErrorCompras(err).mensaje, 'error');
        }
      }
    });
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }

  anular(c: any): void {
    if (!this.puedeEscribir) return;
    Swal.fire({
      title: `¿Anular la compra #${c.idCompra}?`,
      text: 'La compra se anulará y el stock que sumó se devolverá. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.anular(c.idCompra).subscribe({
        next: () => {
          Swal.fire('Anulada', 'Compra anulada correctamente', 'success');
          this.cerrarDetalle();
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          // 409: ese stock ya se vendió, el servidor explica el motivo
          const aviso = err.status === 404 || err.status === 409;
          Swal.fire(err.status === 404 ? 'No encontrada' : err.status === 409 ? 'No se puede anular' : 'Error', leerErrorCompras(err).mensaje, aviso ? 'warning' : 'error');
          if (err.status === 404) this.cargar();
        }
      });
    });
  }

  /** Sin ceros sobrantes: 2.5, no 2.500. */
  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  codigoUnidad(d: any): string {
    return d.producto?.unidadMedida?.codigo || d.producto?.unidadMedida?.nombre || '';
  }
}
