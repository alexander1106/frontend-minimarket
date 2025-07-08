import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { VentasService } from '../../../../../service/ventas.service';
import { DetallesVentasService } from '../../../../../service/detalles-ventas-service.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoginService } from '../../../../../service/login.service';
import baseUrl from '../../../../../components/link';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-ventas',
  standalone: true,
  imports: [BarraLateralComponent, HeaderComponent, CommonModule, RouterModule],
  templateUrl: './list-ventas.component.html',
  styleUrl: './list-ventas.component.css'
})
export class ListVentasComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltrados: any[] = [];
  filtroBusqueda: string = '';
mostrarModalDetalleVenta = false;
ventaSeleccionada: any = null;

  paginaActual: number = 1;
  elementosPorPagina: number = 5;

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
      console.log('Ventas de la sucursal cargadas:', data);
      this.ventas = data || [];
    },
    error: (err) => {
      Swal.fire("Error", "No se pudieron cargar las ventas de la sucursal", "error");
      console.error(err);
    }
  });
}

verDetalleVenta(venta: any) {
  this.ventaSeleccionada = venta;
  this.mostrarModalDetalleVenta = true;

}

consoleLogVenta(venta: any) {
  console.log('Venta seleccionada:', venta);
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

          const doc = new jsPDF();
          const empresa = this.loginService.getEmpresa() || {};
          const tipo = venta.tipo_comprobante?.toUpperCase() || 'FACTURA';
          const cliente = venta.cliente || {};
          const totalVenta = venta.total_venta || detalles.reduce(
            (sum: number, d: any) => sum + (d.precioUnitario ?? 0) * (d.cantidad ?? 0),
            0
          );

          // Encabezado empresa
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(empresa.razonsocial || 'EMPRESA', 10, 15);
          doc.setFont("helvetica", "normal");
          doc.text(`RUC: ${empresa.ruc || '-'}`, 10, 20);
          doc.text(empresa.direccion || '-', 10, 25);
          doc.text(`${empresa.ciudad || ''}`, 10, 30);

          // Tipo de comprobante
          let tituloComprobante = 'COMPROBANTE DE VENTA';
          if (tipo === 'FACTURA') {
            tituloComprobante = 'FACTURA ELECTRÓNICA';
          } else if (tipo === 'BOLETA') {
            tituloComprobante = 'BOLETA ELECTRÓNICA';
          }

          doc.roundedRect(145, 10, 55, 25, 2, 2);
          doc.setFontSize(11);
          doc.text(tituloComprobante, 172, 18, { align: "center" });
          doc.setFontSize(10);
          doc.text(`N° ${venta.nro_comrprobante || '-'}`, 172, 24, { align: "center" });

          // Datos del cliente
          doc.setFontSize(10);
          doc.roundedRect(10, 35, 190, 20, 2, 2);

          if (tipo === 'FACTURA') {
            doc.text(`Cliente: ${cliente.nombre || '-'}`, 12, 40);
            doc.text(`RUC/DNI: ${cliente.documento || '-'}`, 90, 40);
            doc.text(`Moneda: SOLES`, 150, 40);
            doc.text(`Dirección: ${cliente.direccion || '-'}`, 12, 46);
            doc.text(`Ciudad: ${cliente.ciudad || '-'}`, 90, 46);
            doc.text(`Condición de Pago: ${venta.condicion_pago || 'Contado'}`, 150, 46);
          } else {
            doc.text(`Cliente: ${cliente.nombre || '-'}`, 12, 40);
            doc.text(`DNI: ${cliente.documento || '-'}`, 90, 40);
            doc.text(`Fecha: ${venta.fecha || new Date().toLocaleDateString()}`, 150, 40);
            doc.text(`Dirección: ${cliente.direccion || '-'}`, 12, 46);
          }

          // Fechas y orden de compra solo para factura
          if (tipo === 'FACTURA') {
            doc.roundedRect(10, 58, 190, 14, 2, 2);
            doc.text(`Fecha Emisión: ${venta.fecha || new Date().toLocaleDateString()}`, 12, 64);
            doc.text(`Forma de Pago: ${venta.condicion_pago || 'Contado'}`, 90, 64);
            doc.text(`Orden de Compra: ${venta.orden_compra || '-'}`, 150, 64);
          }

          // Tabla productos
          const startY = tipo === 'FACTURA' ? 75 : 60;
          autoTable(doc, {
            startY,
            head: [['CÓDIGO', 'CANT.', 'UNID.', 'DESCRIPCIÓN', 'V. UNIT.', 'DSCTO.', 'V. VENTA']],
            body: detalles.map((d: any) => [
              d.producto?.codigo || '-',
              d.cantidad,
              '1',
              d.producto?.nombre || 'Producto',
              (d.precioUnitario ?? 0).toFixed(2),
              '0.00',
              ((d.precioUnitario ?? 0) * (d.cantidad ?? 0)).toFixed(2)
            ]),
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
            theme: 'grid'
          });

          const finalY = (doc as any).lastAutoTable.finalY || startY + 10;

          // Totales
          const totales = [
            ['SUB TOTAL', totalVenta.toFixed(2)],
            ['IGV (0%)', '0.00'],
            ['TOTAL', totalVenta.toFixed(2)]
          ];

          let yTotales = finalY + 5;
          totales.forEach(([label, amount]) => {
            doc.roundedRect(140, yTotales, 60, 6, 1, 1);
            doc.setFontSize(9);
            doc.text(label, 142, yTotales + 4);
            doc.text(`S/ ${amount}`, 198, yTotales + 4, { align: 'right' });
            yTotales += 7;
          });

          doc.save(`${tituloComprobante.replace(/ /g, "_")}_Venta_${venta.id}.pdf`);
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
  console.log("cerrando modal");
  this.mostrarModalDetalleVenta = false;
  this.ventaSeleccionada = null;
}

}
