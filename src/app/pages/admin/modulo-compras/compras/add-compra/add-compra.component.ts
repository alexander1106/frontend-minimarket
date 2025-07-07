import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ComprasService } from '../../../../../service/compras.service';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { SucursalesService } from '../../../../../service/sucursales.service';
import { ProductosService } from '../../../../../service/productos.service';
import { MetodoPagoService } from '../../../../../service/metodo-pago.service';
import { LoginService } from '../../../../../service/login.service';
import { EmpresasService } from '../../../../../service/empresas.service';
import { AjusteInventarioService } from '../../../../../service/ajuste-inventario.service';

@Component({
  selector: 'app-add-compra',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './add-compra.component.html',
  styleUrls: ['./add-compra.component.css']
})
export class AddCompraComponent implements OnInit {
  compra = {
    idCompra: null,
    proveedor: null as any,
    sucursal: null as any,
    metodoPago: null as any,
    descripcion: '',
    total: 0,
    detalles: [] as any[]
  };

  productos: any[] = [];
  proveedores: any[] = [];
  sucursales: any[] = [];
  metodosPago: any[] = [];
  productoSeleccionado: any = null;
  cantidad: number = 1;
  modo: 'crear' | 'ver' = 'crear';
  empresaUsuario: any;
  cargandoDatos: boolean = true;

  // Columnas para la tabla de productos
  displayedColumns: string[] = ['nombre', 'cantidad', 'precioCompra', 'precioVenta', 'subTotal', 'acciones'];

  constructor(
    private dialogRef: MatDialogRef<AddCompraComponent>,
    private comprasService: ComprasService,
    private proveedoresService: ProveedoresService,
    private sucursalesService: SucursalesService,
    private productosService: ProductosService,
    private metodosPagoService: MetodoPagoService,
    private loginService: LoginService,
    private empresasService: EmpresasService,
    private ajusteInventarioService: AjusteInventarioService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    try {
      this.cargandoDatos = true;
      
      const user = this.loginService.getUser();
      
      if (!user) {
        Swal.fire('Error', 'No se pudo obtener la información del usuario', 'error');
        this.dialogRef.close();
        return;
      }

      if (!user.sucursal || !user.sucursal.idSucursal) {
        Swal.fire('Error', 'El usuario no tiene una sucursal asignada correctamente', 'error');
        this.dialogRef.close();
        return;
      }

      const empresaSucursal = await this.sucursalesService.obtenerEmpresPorSucursal(user.sucursal.idSucursal).toPromise();
      
      if (!empresaSucursal) {
        Swal.fire('Error', 'No se pudo obtener la empresa asociada a la sucursal', 'error');
        this.dialogRef.close();
        return;
      }

      this.empresaUsuario = await this.empresasService.buscar(empresaSucursal.idempresa).toPromise();
      if (!this.empresaUsuario) {
        Swal.fire('Error', 'No se pudo cargar la información de la empresa', 'error');
        this.dialogRef.close();
        return;
      }

      await Promise.all([
        this.cargarProveedores(),
        this.cargarSucursales(),
        this.cargarProductos(),
        this.cargarMetodosPago()
      ]);

      if (this.data) {
        if (this.data.modo === 'ver') {
          this.modo = 'ver';
          this.compra = JSON.parse(JSON.stringify(this.data.compra));
          this.cargarDatosRelacionados();
          this.displayedColumns = ['nombre', 'cantidad', 'precioCompra', 'precioVenta', 'subTotal'];
        }
      } else {
        this.compra.sucursal = user.sucursal;
        
        const sucursalEnListado = this.sucursales.find(s => s.idSucursal === user.sucursal.idSucursal);
        if (!sucursalEnListado) {
          this.sucursales.push(user.sucursal);
        }
      }

    } catch (error) {
      console.error('Error en ngOnInit:', error);
      Swal.fire('Error', 'Ocurrió un error al cargar los datos', 'error');
    } finally {
      this.cargandoDatos = false;
    }
  }

  async cargarProveedores(): Promise<void> {
    try {
      const proveedores: any = await this.proveedoresService.buscarPorEmpresa(this.empresaUsuario.idempresa).toPromise();
      this.proveedores = proveedores || [];
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      this.proveedores = [];
    }
  }

  async cargarSucursales(): Promise<void> {
    try {
      const sucursales: any = await this.sucursalesService.listarSucursalesPorEmpresas(this.empresaUsuario.idempresa).toPromise();
      this.sucursales = sucursales || [];
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      Swal.fire('Error', 'No se pudieron cargar las sucursales', 'error');
      this.sucursales = [];
    }
  }

  async cargarProductos(): Promise<void> {
    try {
      const productos = await this.productosService.listarProductos().toPromise();
      this.productos = productos || [];
      
      if (this.modo === 'ver') {
        for (const detalle of this.compra.detalles) {
          const producto = await this.productosService.buscar(detalle.idProducto).toPromise();
          if (producto) {
            detalle.precioCompra = producto.costoCompra;
            detalle.precioVenta = producto.costoVenta;
            detalle.subTotal = detalle.precioCompra * detalle.cantidad;
          }
        }
        this.calcularTotal();
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      this.productos = [];
    }
  }

  async cargarMetodosPago(): Promise<void> {
    try {
      const metodos = await this.metodosPagoService.listarMetodosPago().toPromise();
      this.metodosPago = metodos || [];
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      Swal.fire('Error', 'No se pudieron cargar los métodos de pago', 'error');
      this.metodosPago = [];
    }
  }

  cargarDatosRelacionados(): void {
    if (this.compra.proveedor && typeof this.compra.proveedor === 'number') {
      const proveedor = this.proveedores.find(p => p.idProveedor === this.compra.proveedor);
      if (proveedor) {
        this.compra.proveedor = proveedor;
      }
    }
    
    if (this.compra.sucursal && typeof this.compra.sucursal === 'number') {
      const sucursal = this.sucursales.find(s => s.idSucursal === this.compra.sucursal);
      if (sucursal) {
        this.compra.sucursal = sucursal;
      }
    }
    
    if (this.compra.metodoPago && typeof this.compra.metodoPago === 'number') {
      const metodo = this.metodosPago.find(m => m.id === this.compra.metodoPago);
      if (metodo) {
        this.compra.metodoPago = metodo;
      }
    }
  }

  onProductoChange(): void {
    if (this.productoSeleccionado && this.productoSeleccionado.id) {
      this.productosService.buscar(this.productoSeleccionado.id).subscribe({
        next: (producto: any) => {
          this.productoSeleccionado = {
            ...this.productoSeleccionado,
            costoCompra: producto.costoCompra,
            costoVenta: producto.costoVenta,
            precioCompra: producto.costoCompra,
            precioVenta: producto.costoVenta
          };
        },
        error: (err) => {
          console.error('Error al obtener precios del producto:', err);
          Swal.fire('Error', 'No se pudieron obtener los precios del producto', 'error');
        }
      });
    }
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || this.cantidad <= 0) {
      Swal.fire('Error', 'Seleccione un producto y una cantidad válida', 'error');
      return;
    }

    if (this.productoSeleccionado.costoCompra === undefined || this.productoSeleccionado.costoVenta === undefined) {
      Swal.fire('Error', 'No se pudieron obtener los precios del producto', 'error');
      return;
    }

    const productoExistenteIndex = this.compra.detalles.findIndex(
      d => d.idProducto === this.productoSeleccionado.id
    );

    if (productoExistenteIndex !== -1) {
      // Actualizar producto existente
      this.compra.detalles[productoExistenteIndex].cantidad += this.cantidad;
      this.compra.detalles[productoExistenteIndex].subTotal = 
        this.compra.detalles[productoExistenteIndex].precioCompra * 
        this.compra.detalles[productoExistenteIndex].cantidad;
    } else {
      // Agregar nuevo producto
      this.compra.detalles.push({
        idProducto: this.productoSeleccionado.id,
        nombre: this.productoSeleccionado.nombre,
        cantidad: this.cantidad,
        precioCompra: this.productoSeleccionado.costoCompra,
        precioVenta: this.productoSeleccionado.costoVenta,
        subTotal: this.productoSeleccionado.costoCompra * this.cantidad
      });
    }

    this.calcularTotal();
    this.cantidad = 1;
    // Forzar la actualización de la vista
    this.compra.detalles = [...this.compra.detalles];
  }

  eliminarProducto(index: number): void {
    this.compra.detalles.splice(index, 1);
    this.calcularTotal();
    // Forzar la actualización de la vista
    this.compra.detalles = [...this.compra.detalles];
  }

  calcularTotal(): void {
    this.compra.total = this.compra.detalles.reduce((sum, detalle) => sum + detalle.subTotal, 0);
  }

  get soloLectura(): boolean {
    return this.modo === 'ver';
  }

  async registrarAjusteInventario(idInventarioProducto: number, cantidad: number): Promise<void> {
    const ajusteDTO = {
      idinventarioproducto: idInventarioProducto,
      cantidad: cantidad,
      descripcion: 'Ajuste por compra de productos'
    };

    try {
      await this.ajusteInventarioService.registrar(ajusteDTO).toPromise();
    } catch (error) {
      console.error('Error al registrar ajuste de inventario:', error);
      throw error;
    }
  }

  async guardarCompra(): Promise<void> {
    if (!this.compra.proveedor) {
      Swal.fire('Error', 'Seleccione un proveedor', 'error');
      return;
    }

    if (!this.compra.sucursal) {
      Swal.fire('Error', 'Seleccione una sucursal', 'error');
      return;
    }

    if (!this.compra.metodoPago) {
      Swal.fire('Error', 'Seleccione un método de pago', 'error');
      return;
    }

    if (this.compra.detalles.length === 0) {
      Swal.fire('Error', 'Agregue al menos un producto', 'error');
      return;
    }

    const compraDTO = {
      idProveedor: this.compra.proveedor.idProveedor || this.compra.proveedor,
      idSucursal: this.compra.sucursal.idSucursal || this.compra.sucursal,
      idMetodoPago: this.compra.metodoPago.id || this.compra.metodoPago,
      descripcion: this.compra.descripcion,
      detalles: this.compra.detalles.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        precioCompra: d.precioCompra,
        precioVenta: d.precioVenta
      }))
    };

    try {
      const compraRegistrada = await this.comprasService.crearCompra(compraDTO).toPromise();
      
      for (const detalle of this.compra.detalles) {
        const inventarioProducto = await this.productosService.listarProductosPorSucursal(this.compra.sucursal.idSucursal || this.compra.sucursal)
          .toPromise();
        
        const productoEnInventario = inventarioProducto.find((ip: any) => ip.producto.idproducto === detalle.idProducto);
        
        if (productoEnInventario) {
          await this.registrarAjusteInventario(productoEnInventario.idinventarioproducto, detalle.cantidad);
        } else {
          console.warn(`Producto ${detalle.idProducto} no encontrado en inventario de sucursal`);
        }
      }

      Swal.fire('Éxito', 'Compra registrada correctamente', 'success');
      this.dialogRef.close('guardado');
    } catch (err) {
      console.error('Error al registrar compra:', err);
      Swal.fire('Error', 'No se pudo registrar la compra', 'error');
    }
  }

  cancelar(): void {
    this.dialogRef.close('cancelado');
  }
}