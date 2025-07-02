import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { VentasService } from '../../../../../service/ventas.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    generarPdfVenta(venta: any) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text('Comprobante de Venta', 14, 20);

  // Datos generales
  doc.setFontSize(12);
  doc.text(`Fecha: ${venta.fecha_venta}`, 14, 30);
  doc.text(`Cliente: ${venta.cliente?.nombre || '---'}`, 14, 36);
  doc.text(`Total Venta: $${venta.total_venta.toFixed(2)}`, 14, 42);

  // Tabla de productos
  const productos = venta.detalles?.map((d: any) => [
    d.producto?.nombre || '---',
    d.cantidad,
    `$${d.precioUnitario}`,
    `$${d.subTotal}`
  ]) || [];

  autoTable(doc, {
    startY: 50,
    head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: productos
  });

  // Descargar PDF
  doc.save(`venta_${venta.nro_comrprobante || 'comprobante'}.pdf`);
}

}
