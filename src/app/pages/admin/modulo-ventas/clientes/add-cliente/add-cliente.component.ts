
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
import { ClientesService } from '../../../../../service/clientes.service';

@Component({
  selector: 'app-add-cliente',
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
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.css']
})
export class AddClienteComponent implements OnInit {
  cliente = {
    idCliente: null,
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipoDocumento: '',
    documento: '',
    direccion: '',
  };

  documentosExistentes: string[] = [];

  // 'crear' | 'editar' | 'ver'
  modo: 'crear' | 'editar' | 'ver' = 'crear';

  constructor(
    private dialogRef: MatDialogRef<AddClienteComponent>,
    private clienteService: ClientesService,
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

      if (this.data.cliente) {
        this.cliente = { ...this.data.cliente };
      }
    }

    // Cargar documentos existentes
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.documentosExistentes = clientes.map((c: any) => c.documento);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la lista de clientes', 'error');
      }
    });
  }

  get soloLectura(): boolean {
    return this.modo === 'ver';
  }

  limitarDigitos(event: any) {
    const input = event.target;
    const tipo = this.cliente.tipoDocumento;
    const maxLength = tipo === 'DNI' ? 8 : tipo === 'RUC' ? 11 : null;

    input.value = input.value.replace(/\D/g, '');

    if (maxLength && input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }

    this.cliente.documento = input.value;
  }

  onDocumentoBlur() {
    const tipo = this.cliente.tipoDocumento;
    const doc = this.cliente.documento;

    if (
      (tipo === 'DNI' && doc.length === 8) ||
      (tipo === 'RUC' && doc.length === 11)
    ) {
      this.validarDuplicado();
    }
  }

  validarDuplicado() {
    if (this.modo === 'editar') {
      if (
        this.documentosExistentes.includes(this.cliente.documento) &&
        this.cliente.documento !== this.data?.cliente?.documento
      ) {
        Swal.fire('Atención', 'El número de documento ya está registrado.', 'warning');
        this.cliente.documento = '';
      }
    } else {
      if (this.documentosExistentes.includes(this.cliente.documento)) {
        Swal.fire('Atención', 'El número de documento ya está registrado.', 'warning');
        this.cliente.documento = '';
      }
    }
  }

  guardarCliente() {
    if (
      (this.cliente.tipoDocumento === 'DNI' && this.cliente.documento.length !== 8) ||
      (this.cliente.tipoDocumento === 'RUC' && this.cliente.documento.length !== 11)
    ) {
      Swal.fire('Error', 'El documento no tiene la longitud correcta.', 'error');
      return;
    }

    if (this.modo === 'editar') {
      this.clienteService.editarCliente(this.cliente).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
        }
      });
    } else {
      this.clienteService.registrarCliente(this.cliente).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
          this.dialogRef.close('guardado');
        },
        error: () => {
          Swal.fire('Error', 'No se pudo crear el cliente', 'error');
        }
      });
    }
  }

  cancelar() {
    this.dialogRef.close('cancelado');
  }
}
