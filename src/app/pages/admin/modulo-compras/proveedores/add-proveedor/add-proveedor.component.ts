import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

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
    MatOptionModule
  ],
  templateUrl: './add-proveedor.component.html',
  styleUrls: ['./add-proveedor.component.css']
})
export class AddProveedorComponent implements OnInit {
  proveedor: any = {
    idProveedor: null,
    nombre: '',
    ruc: '',
    regimen: '',
    telefono: '',
    gmail: '',
    direccion: ''
  };

  isEditMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddProveedorComponent>,
    private proveedorService: ProveedoresService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data?.idProveedor) {
      this.isEditMode = true;
      this.cargarProveedor(this.data.idProveedor);
    }
  }

  cargarProveedor(id: number) {
    this.proveedorService.buscarId(id).subscribe({
      next: (data) => {
        this.proveedor = data;
      },
      error: (error) => {
        console.error('Error al cargar proveedor:', error);
        Swal.fire('Error', 'No se pudo cargar el proveedor', 'error');
      }
    });
  }

  guardarProveedor() {
    if (this.proveedor.ruc && this.proveedor.ruc.length !== 11) {
      Swal.fire('Error', 'El RUC debe tener 11 dígitos', 'error');
      return;
    }

    const operacion = this.isEditMode 
      ? this.proveedorService.actualizar(this.proveedor)
      : this.proveedorService.guardar(this.proveedor);

    operacion.subscribe({
      next: () => {
        const mensaje = this.isEditMode 
          ? 'Proveedor actualizado correctamente' 
          : 'Proveedor creado correctamente';
        Swal.fire('Éxito', mensaje, 'success');
        this.dialogRef.close('guardado');
      },
      error: (error) => {
        console.error('Error al guardar proveedor:', error);
        const mensaje = this.isEditMode 
          ? 'No se pudo actualizar el proveedor' 
          : 'No se pudo crear el proveedor';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  onRucChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const valor = inputElement.value;
    const cleanedValue = valor.replace(/\D/g, '').slice(0, 11);
    this.proveedor.ruc = cleanedValue;
  }
}