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
  proveedor = {
    idProveedor: null,
    nombre: '',
    ruc: '',
    regimen: '',
    telefono: '',
    gmail: '',
    direccion: ''
  };

  rucsExistentes: string[] = [];

  // 'crear' | 'editar' | 'ver'
  modo: 'crear' | 'editar' | 'ver' = 'crear';

  constructor(
    private dialogRef: MatDialogRef<AddProveedorComponent>,
    private proveedorService: ProveedoresService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // Determinar el modo
    if (this.data) {
      if (this.data.modo === 'ver') {
        this.modo = 'ver';
      } else if (this.data.modo === 'editar') {
        this.modo = 'editar';
      } else {
        this.modo = 'crear';
      }

      if (this.data.proveedor) {
        this.proveedor = { ...this.data.proveedor };
      } else if (this.data.idProveedor) {
        this.cargarProveedor(this.data.idProveedor);
      }
    }

    // Cargar RUCs existentes
    this.proveedorService.buscarTodos().subscribe({
      next: (proveedores) => {
        this.rucsExistentes = proveedores.map((p: any) => p.ruc);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la lista de proveedores', 'error');
      }
    });
  }

  get soloLectura(): boolean {
    return this.modo === 'ver';
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

  limitarRuc(event: any) {
    const input = event.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 11);
    this.proveedor.ruc = input.value;
  }

  onRucBlur() {
    const ruc = this.proveedor.ruc;
    
    if (ruc.length === 11) {
      this.validarRucDuplicado();
    }
  }

  validarRucDuplicado() {
    if (this.modo === 'editar') {
      if (
        this.rucsExistentes.includes(this.proveedor.ruc) &&
        this.proveedor.ruc !== this.data?.proveedor?.ruc
      ) {
        Swal.fire('Atención', 'El RUC ya está registrado.', 'warning');
        this.proveedor.ruc = '';
      }
    } else {
      if (this.rucsExistentes.includes(this.proveedor.ruc)) {
        Swal.fire('Atención', 'El RUC ya está registrado.', 'warning');
        this.proveedor.ruc = '';
      }
    }
  }

  guardarProveedor() {
    if (this.proveedor.ruc.length !== 11) {
      Swal.fire('Error', 'El RUC debe tener 11 dígitos.', 'error');
      return;
    }

    // Usamos guardar() para ambos casos (crear y editar) ya que el backend usa save() para ambos
    this.proveedorService.guardar(this.proveedor).subscribe({
      next: () => {
        const mensaje = this.modo === 'editar' 
          ? 'Proveedor actualizado correctamente' 
          : 'Proveedor creado correctamente';
        Swal.fire('Éxito', mensaje, 'success');
        this.dialogRef.close('guardado');
      },
      error: () => {
        const mensaje = this.modo === 'editar'
          ? 'No se pudo actualizar el proveedor'
          : 'No se pudo crear el proveedor';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  cancelar() {
    this.dialogRef.close('cancelado');
  }
}