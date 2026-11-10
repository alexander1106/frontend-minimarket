import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import baseUrl from '../../../components/link';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { DashboardSuperadminComponent } from './dashboard-superadmin.component';
import { LoginService } from '../../../service/login.service';
import { VentasService } from '../../../service/ventas.service';
import { ClientesService } from '../../../service/clientes.service';
import { ProductosService, StockBajoItem } from '../../../service/productos.service';
import { Lote, LotesService } from '../../../service/lotes.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, BarraLateralComponent, HeaderComponent, DashboardSuperadminComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  esSuper = false;
  hoy = new Date();
  nombre = '';
  cargando = true;

  totalVentas = 0;
  montoTotal = 0;
  ventasHoy = 0;
  montoHoy = 0;
  clientes = 0;
  productos = 0;
  recientes: any[] = [];
  dias: { etiqueta: string; monto: number; alto: number; hoy: boolean }[] = [];
  caja: any = null;
  cajaCargada = false;
  montoMes = 0;
  stockBajo: StockBajoItem[] = [];
  stockBajoCargado = false;
  porVencer: Lote[] = [];
  porVencerCargado = false;
  ventasMes = 0;

  get totalVencidos(): number {
    return this.porVencer.filter(l => l.vencido).length;
  }

  estadoLote(l: Lote): 'vencido' | 'pronto' | 'ok' {
    if (l.vencido) return 'vencido';
    return l.diasParaVencer != null && l.diasParaVencer <= 7 ? 'pronto' : 'ok';
  }

  textoVence(l: Lote): string {
    if (l.diasParaVencer == null) return 'Sin fecha';
    if (l.vencido) return `Vencido hace ${Math.abs(l.diasParaVencer)} d`;
    if (l.diasParaVencer === 0) return 'Vence hoy';
    return `En ${l.diasParaVencer} d`;
  }

  accesos = [
    { icono: 'fa-cash-register', titulo: 'Nueva venta', desc: 'Abrir el punto de venta', ruta: '/admin/add-venta' },
    { icono: 'fa-users', titulo: 'Clientes', desc: 'Gestionar clientes', ruta: '/admin/list-clientes' },
    { icono: 'fa-file-invoice-dollar', titulo: 'Cotizaciones', desc: 'Ver cotizaciones', ruta: '/admin/list-cotizaciones' },
    { icono: 'fa-vault', titulo: 'Caja', desc: 'Aperturas y arqueos', ruta: '/admin/list-apertura' },
  ];

  constructor(
    private loginService: LoginService,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private lotesService: LotesService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esSuper = this.loginService.hasRole('SUPERADMIN');
    if (this.esSuper) { return; }
    const user = this.loginService.getUser();
    this.nombre = user?.nombre || '';
    const idSucursal = user?.sucursal?.idSucursal;
    if (!idSucursal) { this.cargando = false; return; }

    this.ventasService.buscarVentasPorSucursal(idSucursal).subscribe({
      next: (ventas: any) => {
        const lista: any[] = Array.isArray(ventas) ? ventas : [];
        const hoyStr = this.hoy.toISOString().slice(0, 10);
        this.totalVentas = lista.length;
        this.montoTotal = lista.reduce((a, v) => a + Number(v.total_venta || 0), 0);
        const deHoy = lista.filter(v => String(v.fecha_venta || '').slice(0, 10) === hoyStr);
        this.ventasHoy = deHoy.length;
        this.montoHoy = deHoy.reduce((a, v) => a + Number(v.total_venta || 0), 0);
        const mesStr = hoyStr.slice(0, 7);
        const delMes = lista.filter(v => String(v.fecha_venta || '').slice(0, 7) === mesStr);
        this.montoMes = delMes.reduce((a, v) => a + Number(v.total_venta || 0), 0);
        this.ventasMes = delMes.length;
        const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const serie = [] as { etiqueta: string; monto: number; alto: number; hoy: boolean }[];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(this.hoy); d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const monto = lista.filter(v => String(v.fecha_venta || '').slice(0, 10) === key)
            .reduce((a, v) => a + Number(v.total_venta || 0), 0);
          serie.push({ etiqueta: nombres[d.getDay()], monto, alto: 0, hoy: i === 0 });
        }
        const max = Math.max(...serie.map(s => s.monto), 1);
        serie.forEach(s => s.alto = Math.max(4, Math.round((s.monto / max) * 100)));
        this.dias = serie;
        this.recientes = [...lista]
          .sort((a, b) => String(b.fecha_venta).localeCompare(String(a.fecha_venta)))
          .slice(0, 6);
        this.cargando = false;
      },
      error: () => (this.cargando = false)
    });
    if (user?.idUsuario) {
      this.http.get(`${baseUrl}/aperturas-cajas/usuario/${user.idUsuario}/abierta`).subscribe({
        next: (c: any) => { this.caja = c || null; this.cajaCargada = true; },
        error: () => { this.caja = null; this.cajaCargada = true; }
      });
    }
    this.clientesService.listarClientesPorSucursal(idSucursal).subscribe({
      next: (c: any) => (this.clientes = Array.isArray(c) ? c.length : 0), error: () => {}
    });
    // Lotes que vencen en los próximos 30 días (e incluso ya vencidos), los más urgentes primero
    this.lotesService.porVencer(30, idSucursal).subscribe({
      next: lista => { this.porVencer = Array.isArray(lista) ? lista : []; this.porVencerCargado = true; },
      error: () => { this.porVencer = []; this.porVencerCargado = true; }
    });
    this.productosService.stockBajo(idSucursal).subscribe({
      next: lista => {
        this.stockBajo = (Array.isArray(lista) ? lista : []).sort((a, b) => a.stockActual - b.stockActual);
        this.stockBajoCargado = true;
      },
      error: () => { this.stockBajo = []; this.stockBajoCargado = true; }
    });
    this.productosService.listarProductosPorSucursal(idSucursal).subscribe({
      next: (p: any) => (this.productos = Array.isArray(p) ? p.length : 0), error: () => {}
    });
  }
}
