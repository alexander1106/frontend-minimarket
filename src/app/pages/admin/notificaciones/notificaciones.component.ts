import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { PaginacionComponent } from '../../../components/paginacion/paginacion.component';
import {
  ETIQUETAS_NOTIFICACION, ICONOS_NOTIFICACION, Notificacion, NotificacionesService, tiempoRelativo
} from '../../../service/notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent implements OnInit {
  items: Notificacion[] = [];
  total = 0;
  noLeidas = 0;
  pagina = 1;
  porPagina = 20;
  soloNoLeidas = false;
  tipo = '';
  cargando = true;

  readonly iconos = ICONOS_NOTIFICACION;
  readonly etiquetas = ETIQUETAS_NOTIFICACION;
  readonly tipos = Object.keys(ETIQUETAS_NOTIFICACION);
  readonly tiempo = tiempoRelativo;

  constructor(private service: NotificacionesService, private router: Router) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar({
      soloNoLeidas: this.soloNoLeidas,
      tipo: this.tipo || undefined,
      pagina: this.pagina - 1,
      tamano: this.porPagina
    }).subscribe({
      next: r => {
        this.items = r?.items || [];
        this.total = r?.total || 0;
        this.noLeidas = r?.noLeidas || 0;
        this.cargando = false;
        const paginas = Math.max(1, r?.totalPaginas || 1);
        if (this.pagina > paginas) {
          this.pagina = paginas;
          this.cargar();
        }
      },
      error: () => { this.cargando = false; }
    });
  }

  filtrar(soloNoLeidas: boolean): void {
    this.soloNoLeidas = soloNoLeidas;
    this.pagina = 1;
    this.cargar();
  }

  cambiarTipo(): void {
    this.pagina = 1;
    this.cargar();
  }

  cambiarPagina(p: number): void {
    this.pagina = p;
    this.cargar();
  }

  cambiarFilas(n: number): void {
    this.porPagina = n;
    this.pagina = 1;
    this.cargar();
  }

  private alError = (err: any) => {
    if (err?.status === 404) this.cargar();
  };

  abrir(n: Notificacion): void {
    const ruta = this.service.rutaDestino(n.ruta);
    const ir = () => { if (ruta) this.router.navigateByUrl(ruta); };
    if (n.leida) { ir(); return; }
    this.service.marcarLeida(n.idNotificacion).subscribe({ next: ir, error: e => { this.alError(e); ir(); } });
  }

  alternarLeida(n: Notificacion, e: Event): void {
    e.stopPropagation();
    const op = n.leida ? this.service.marcarNoLeida(n.idNotificacion) : this.service.marcarLeida(n.idNotificacion);
    op.subscribe({ next: () => this.cargar(), error: this.alError });
  }

  eliminar(n: Notificacion, e: Event): void {
    e.stopPropagation();
    this.service.eliminar(n.idNotificacion).subscribe({ next: () => this.cargar(), error: this.alError });
  }

  marcarTodas(): void {
    this.service.marcarTodas().subscribe(() => this.cargar());
  }

  eliminarLeidas(): void {
    Swal.fire({
      title: 'Eliminar notificaciones leídas',
      text: 'Se eliminarán todas las notificaciones que ya leíste.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.service.eliminarLeidas().subscribe(() => this.cargar());
    });
  }
}
