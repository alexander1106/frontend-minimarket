import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientesService } from '../../../../../service/clientes.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-cliente',
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
export class AddClienteComponent {
  cliente = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipoDocumento: '',
    documento: '',
    direccion: '',
    // otros campos...
  };

  constructor(
    private dialogRef: MatDialogRef<AddClienteComponent>,
    private clienteService: ClientesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  guardarCliente() {
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

  cancelar() {
    this.dialogRef.close();
  }

onDocumentoChange(valor: string) {
  const tipo = this.cliente.tipoDocumento;

  if (tipo === 'DNI' && valor.length === 8) {
    this.buscarDatosReniec();
  } else if (tipo === 'RUC' && valor.length === 11) {
    this.buscarDatosReniec();
  } else {
    this.cliente.nombre = '';
    this.cliente.apellidos = '';
  }
}

  buscarDatosReniec() {
    this.clienteService.consultarReniec(this.cliente.documento).subscribe({
      next: (data: any) => {
        this.cliente.nombre = data.nombres ?? '';
        this.cliente.apellidos = `${data.apellidoPaterno ?? ''} ${data.apellidoMaterno ?? ''}`.trim();
      },
      error: () => {
        Swal.fire('Error', 'No se encontraron datos para el DNI ingresado', 'error');
        this.cliente.nombre = '';
        this.cliente.apellidos = '';
      }
    });
  }
}
