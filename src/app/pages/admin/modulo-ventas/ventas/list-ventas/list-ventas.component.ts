import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { VentasService } from '../../../../../service/ventas.service';

@Component({
  selector: 'app-list-ventas',
   standalone: true,
  imports: [BarraLateralComponent, HeaderComponent,CommonModule,RouterModule], // ✅ Agregar aquí
 templateUrl: './list-ventas.component.html',
  styleUrl: './list-ventas.component.css'
})
export class ListVentasComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltrados: any[] = [];
  filtroBusqueda: string = '';


  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
  private ventasService: VentasService,
  private router: Router,
  private route: ActivatedRoute
) {}

ngOnInit(): void {
  this.listarVentas ();


  }
listarVentas() {
      this.ventasService.listarVentas().subscribe({
        next: (data: any) => {
          console.log('Métodos cargados:', data);
          this.ventas = data || [];
        },
        error: (err) => {
          Swal.fire("Error", "No se pudieron cargar los métodos", "error");
          console.error(err);
        }
      });
    }
}
