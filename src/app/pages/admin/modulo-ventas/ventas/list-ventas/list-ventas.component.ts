import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { VentasService } from '../../../../../service/ventas.service';
import { DetallesVentasService } from '../../../../../service/detalles-ventas-service.service';
import { generarBoleta, generarFactura, logoEnGrises } from './comprobante-pdf';
import { LoginService } from '../../../../../service/login.service';
import baseUrl from '../../../../../components/link';
import { HttpClient } from '@angular/common/http';
import { PaginacionComponent } from '../../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../../components/paginacion/paginar.pipe';

@Component({
  selector: 'app-list-ventas',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, BarraLateralComponent, HeaderComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './list-ventas.component.html',
  styleUrl: './list-ventas.component.css'
})
export class ListVentasComponent implements OnInit {
  pagina = 1;
  porPagina = 5;
  ventas: any[] = [];
  filtrados: any[] = [];
  filtro = '';
  tipoFiltro = '';
  cargando = true;
mostrarModalDetalleVenta = false;
ventaSeleccionada: any = null;


  constructor(
    private ventasService: VentasService,
    private detallesVentasService: DetallesVentasService,
    private router: Router,
    private loginService:LoginService,
    private http:HttpClient,
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  const user = this.loginService.getUser();
  const idSucursal = user?.sucursal?.idSucursal;

  if (idSucursal) {
    this.listarVentasPorSucursal(idSucursal);
  } else {
    Swal.fire('Error', 'No se encontró la sucursal del usuario logueado.', 'error');
  }
}

listarVentasPorSucursal(idSucursal: number) {
  this.ventasService.buscarVentasPorSucursal(idSucursal).subscribe({
    next: (data: any) => {
      this.ventas = (Array.isArray(data) ? data : []).sort((a: any, b: any) => String(b.fecha_venta).localeCompare(String(a.fecha_venta)));
      this.cargando = false;
      this.buscar();
    },
    error: (err: any) => {
      this.cargando = false;
      if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar las ventas de la sucursal', 'error');
    }
  });
}

verDetalleVenta(venta: any) {
  this.ventaSeleccionada = venta;
  this.mostrarModalDetalleVenta = true;
  const id = venta?.id ?? venta?.idVenta;
  if (id != null) {
    this.ventasService.buscarVentaPorId(id).subscribe({
      next: (completa: any) => {
        if (!completa || this.ventaSeleccionada !== venta) return;
        this.ventaSeleccionada = {
          ...venta,
          vendedor: completa.vendedor ?? venta.vendedor,
          idVendedor: completa.idVendedor ?? venta.idVendedor,
          idAperturaCaja: completa.idAperturaCaja ?? venta.idAperturaCaja,
          opGravada: completa.opGravada,
          opInafecta: completa.opInafecta,
          igv: completa.igv
        };
      },
      error: () => { }
    });
  }

}

montoIgv(v: any): string {
  return v == null ? '-' : 'S/ ' + Number(v).toFixed(2);
}

buscar(): void {
  const t = this.filtro.trim().toLowerCase();
  this.filtrados = this.ventas.filter(v =>
    (!this.tipoFiltro || v.tipo_comprobante === this.tipoFiltro) &&
    (!t || [v.cliente?.nombre, v.cliente?.apellidos, v.nro_comrprobante, v.tipo_comprobante, v.vendedor]
      .some(x => String(x ?? '').toLowerCase().includes(t)))
  );
  this.pagina = 1;
}

get tipos(): string[] {
  return [...new Set(this.ventas.map(v => v.tipo_comprobante).filter(Boolean))] as string[];
}

get totalVendido(): number {
  return this.ventas.reduce((s, v) => s + Number(v.total_venta || 0), 0);
}

get promedio(): number {
  return this.ventas.length ? this.totalVendido / this.ventas.length : 0;
}

nombreCliente(v: any): string {
  return `${v?.cliente?.nombre || ''} ${v?.cliente?.apellidos || ''}`.trim() || '—';
}
generarComprobantePdf(idVenta: number | undefined) {
  if (idVenta === undefined || idVenta === null) {
    Swal.fire('Error', 'ID de venta no válido.', 'error');
    return;
  }

  this.ventasService.buscarVentaPorId(idVenta).subscribe({
    next: (venta) => {
      if (!venta) {
        Swal.fire('Error', 'Venta no encontrada.', 'error');
        return;
      }

      this.detallesVentasService.buscarDetallesPorIdVenta(idVenta).subscribe({
        next: (detalles) => {
          if (!detalles || detalles.length === 0) {
            Swal.fire('Error', 'No se encontraron detalles de la venta.', 'error');
            return;
          }

          const empresa = this.loginService.getEmpresa() || {};
          const idEmpresa = empresa.idempresa ?? empresa.idEmpresa;
          let logo: string | null = null;
          try { logo = idEmpresa ? localStorage.getItem(`empresaLogo_${idEmpresa}`) : null; } catch { }
          const esFactura = String(venta.tipo_comprobante || '').toUpperCase() === 'FACTURA';
          const nombre = (venta.nro_comrprobante || `Venta_${venta.id}`).replace(/[^\w-]/g, '_');
          if (esFactura) {
            generarFactura({ empresa, logo, venta, detalles }).save(`Factura_${nombre}.pdf`);
          } else {
            logoEnGrises(logo).then(gris => {
              generarBoleta({ empresa, logo: gris, venta, detalles }).save(`Boleta_${nombre}.pdf`);
            });
          }
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudieron obtener los detalles de la venta.', 'error');
          console.error(err);
        }
      });
    },
    error: (err) => {
      Swal.fire('Error', 'No se pudo obtener la venta.', 'error');
      console.error(err);
    }
  });
}

cerrarModalDetalleVenta() {
  this.mostrarModalDetalleVenta = false;
  this.ventaSeleccionada = null;
}

}
