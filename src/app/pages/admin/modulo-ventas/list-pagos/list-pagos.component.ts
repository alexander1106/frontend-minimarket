import { Component, OnInit } from '@angular/core';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VentasService } from '../../../../service/ventas.service';
import Swal from 'sweetalert2';
import { PagosService } from '../../../../service/pagos.service';

@Component({
  selector: 'app-list-pagos',
  imports: [BarraLateralComponent, HeaderComponent,CommonModule,RouterModule], // ✅ Agregar aquí
  templateUrl: './list-pagos.component.html',
  styleUrl: './list-pagos.component.css'
})
export class ListPagosComponent implements OnInit {
  pagos: any[] = [];
  pagosFiltrados: any[] = [];
  filtroBusqueda: string = '';


  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
  private pagosService: PagosService,
  private router: Router,
  private route: ActivatedRoute
) {}

ngOnInit(): void {
  this.listarVentas ();


  }
listarVentas() {
      this.pagosService.listarPagos().subscribe({
        next: (data: any) => {
          console.log('Pagos cargados:', data);
          this.pagos = data || [];
        },
        error: (err) => {
          Swal.fire("Error", "No se pudieron cargar los pagos", "error");
          console.error(err);
        }
      });
    }
}
