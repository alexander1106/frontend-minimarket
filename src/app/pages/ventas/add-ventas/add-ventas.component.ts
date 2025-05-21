import { Component, OnInit } from '@angular/core';
import { BarraLateralComponent } from "../../../components/barra-lateral/barra-lateral.component";
import { HeaderComponent } from "../../../components/header/header.component";
import { CategoriasService } from '../../../service/categorias.service';
import { CommonModule } from '@angular/common'; // 👈 Necesario para *ngFor y *ngIf
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-ventas',
  standalone: true,
  imports: [BarraLateralComponent, HeaderComponent,CommonModule,RouterModule],
  templateUrl: './add-ventas.component.html',
  styleUrls: ['./add-ventas.component.css']
})
export class AddVentasComponent implements OnInit {
  categorias: any[] = [];

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit(): void {
    this.categoriasService.listarCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorías', err)
    });
  }
  seleccionarCategoria(categoria: any): void {
  console.log('Categoría seleccionada:', categoria);
  // Aquí puedes filtrar productos, por ejemplo
}

}
