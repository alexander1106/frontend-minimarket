import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-proveedor',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    DatePipe
  ],
  templateUrl: './add-proveedor.component.html',
  styleUrls: ['./add-proveedor.component.css']
})
export class AddProveedorComponent implements OnInit {
  public proveedor = {
    Id_Proveedor: null,
    nombre: '',
    ruc: '',
    regimen: '',
    telefono: '',
    gmail: '',
    direccion: '',
    fecha_registro: this.getCurrentDate() // Usamos la función para fecha local
  };

  public modo: 'crear' | 'editar' | 'ver' = 'crear';
  public rucsExistentes: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddProveedorComponent>,
    private proveedorService: ProveedoresService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Función para obtener la fecha actual en formato YYYY-MM-DD (local)
  private getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // Formato ISO (YYYY-MM-DD) en hora local
  }

  get isEditMode(): boolean {
    return this.modo === 'editar';
  }

  get isViewMode(): boolean {
    return this.modo === 'ver';
  }

  ngOnInit() {
    if (this.data) {
      this.modo = this.data.modo || 'crear';
      
      if (this.data.proveedor) {
        this.proveedor = { 
          ...this.data.proveedor,
          fecha_registro: this.formatDate(this.data.proveedor.fecha_registro)
        };
      } else if (this.data.Id_Proveedor) {
        this.cargarProveedor(this.data.Id_Proveedor);
      }
    }

    this.cargarRucsExistentes();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return this.getCurrentDate();
    
    // Si ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si viene como timestamp o otro formato
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  }

  cargarRucsExistentes() {
    this.proveedorService.buscarTodos().subscribe({
      next: (proveedores) => {
        this.rucsExistentes = proveedores.map((p: any) => p.ruc);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la lista de proveedores', 'error');
      }
    });
  }

  cargarProveedor(id: number) {
    this.proveedorService.buscarId(id).subscribe({
      next: (data) => {
        this.proveedor = { 
          ...data,
          fecha_registro: this.formatDate(data.fecha_registro)
        };
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el proveedor', 'error');
      }
    });
  }

  onRucChange(event: any) {
    const ruc = event.target.value.replace(/\D/g, '').slice(0, 11);
    this.proveedor.ruc = ruc;
    if (ruc.length === 11) this.validarRucDuplicado();
  }

  validarRucDuplicado() {
    const esDuplicado = this.rucsExistentes.includes(this.proveedor.ruc) &&
      (this.modo !== 'editar' || this.proveedor.ruc !== this.data?.proveedor?.ruc);
    if (esDuplicado) {
      Swal.fire('Atención', 'El RUC ya está registrado.', 'warning');
      this.proveedor.ruc = '';
    }
  }

  guardarProveedor() {
    // Validación de campos requeridos
    if (!this.proveedor.nombre || !this.proveedor.ruc || !this.proveedor.regimen) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    // Validación de RUC
    if (this.proveedor.ruc.length !== 11) {
      Swal.fire('Error', 'El RUC debe tener 11 dígitos.', 'error');
      return;
    }

    // Actualizamos la fecha de registro con la fecha actual local
    this.proveedor.fecha_registro = this.getCurrentDate();

    if (this.modo === 'editar') {
      this.proveedorService.modificar(this.proveedor).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Proveedor actualizado correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: (err) => {
          console.error('Error al actualizar proveedor:', err);
          Swal.fire('Error', 'No se pudo actualizar el proveedor', 'error');
        }
      });
    } else {
      this.proveedorService.guardar(this.proveedor).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Proveedor creado correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: (err) => {
          console.error('Error al crear proveedor:', err);
          Swal.fire('Error', 'No se pudo crear el proveedor', 'error');
        }
      });
    }
  }

  cancelar() {
    this.dialogRef.close('cancelado');
  }
}