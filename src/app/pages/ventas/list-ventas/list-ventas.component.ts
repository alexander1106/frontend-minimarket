import { Component } from '@angular/core';
import { BarraLateralComponent } from "../../../components/barra-lateral/barra-lateral.component";
import { HeaderComponent } from "../../../components/header/header.component";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-ventas',
   standalone: true,
  imports: [BarraLateralComponent, HeaderComponent,CommonModule,RouterModule], // ✅ Agregar aquí
 templateUrl: './list-ventas.component.html',
  styleUrl: './list-ventas.component.css'
})
export class ListVentasComponent {

}
