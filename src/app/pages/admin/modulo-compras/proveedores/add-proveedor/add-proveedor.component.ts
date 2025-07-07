import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { LoginService } from '../../../../../service/login.service';

interface Proveedor {
  idProveedor?: number;
  nombre: string;
  ruc: string;
  regimen: string;
  telefono: string;
  gmail: string;
  direccion: string;
  fecha_registro: string;
  idEmpresa: number;
  estado: number;
}

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
  public proveedor: Proveedor = {
    nombre: '',
    ruc: '',
    regimen: '',
    telefono: '',
    gmail: '',
    direccion: '',
    fecha_registro: this.getCurrentDate(),
    idEmpresa: 0,
    estado: 1
  };

  public modo: 'crear' | 'editar' | 'ver' = 'crear';
  public rucsExistentes: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddProveedorComponent>,
    private proveedorService: ProveedoresService,
    private loginService: LoginService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
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
          fecha_registro: this.formatDate(this.data.proveedor.fecha_registro),
          idEmpresa: this.data.proveedor.idEmpresa || this.loginService.getEmpresa()?.idempresa,
          estado: this.data.proveedor.estado ?? 1
        };
      } else if (this.data.idProveedor) {
        this.cargarProveedor(this.data.idProveedor);
      } else if (this.data.idEmpresa) {
        this.proveedor.idEmpresa = this.data.idEmpresa;
      }
    }

    if (this.modo === 'crear' && !this.proveedor.idEmpresa) {
      const empresa = this.loginService.getEmpresa();
      if (empresa?.idempresa) {
        this.proveedor.idEmpresa = empresa.idempresa;
      }
    }

    this.cargarRucsExistentes();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return this.getCurrentDate();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    return new Date(dateString).toISOString().split('T')[0];
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
          fecha_registro: this.formatDate(data.fecha_registro),
          idEmpresa: data.idEmpresa || this.loginService.getEmpresa()?.idempresa,
          estado: data.estado ?? 1
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
    // Validaciones básicas
    if (!this.proveedor.nombre || !this.proveedor.ruc || !this.proveedor.regimen || !this.proveedor.idEmpresa) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
      return;
    }

    if (this.proveedor.ruc.length !== 11) {
      Swal.fire('Error', 'El RUC debe tener exactamente 11 dígitos', 'error');
      return;
    }

    // Preparar datos para enviar
    const proveedorParaGuardar = {
      ...this.proveedor,
      fecha_registro: this.getCurrentDate(),
      estado: 1
    };

    // Eliminar idProveedor si es creación (usando destructuring)
    if (this.modo === 'crear') {
      const { idProveedor, ...proveedorSinId } = proveedorParaGuardar;
      this.enviarProveedor(proveedorSinId);
    } else {
      this.enviarProveedor(proveedorParaGuardar);
    }
  }

  private enviarProveedor(proveedor: any) {
    const servicio = this.modo === 'editar' 
      ? this.proveedorService.modificar(proveedor) 
      : this.proveedorService.guardar(proveedor);

    servicio.subscribe({
      next: () => {
        Swal.fire('Éxito', `Proveedor ${this.modo === 'editar' ? 'actualizado' : 'creado'} correctamente`, 'success');
        this.dialogRef.close('guardado');
      },
      error: (err) => {
        console.error(`Error al ${this.modo === 'editar' ? 'actualizar' : 'crear'} proveedor:`, err);
        let mensaje = `No se pudo ${this.modo === 'editar' ? 'actualizar' : 'crear'} el proveedor`;
        
        if (err.error?.message) {
          mensaje += `: ${err.error.message}`;
        } else if (err.status === 500) {
          mensaje += ': Error interno del servidor';
        }
        
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  cancelar() {
    this.dialogRef.close('cancelado');
  }
}