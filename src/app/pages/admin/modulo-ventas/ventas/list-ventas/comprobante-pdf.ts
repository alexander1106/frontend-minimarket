import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DatosComprobante {
  empresa: any;
  logo: string | null;
  venta: any;
  detalles: any[];
}

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
  'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO',
  'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function centenas(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]);
  if (r < 30) {
    if (r) partes.push(UNIDADES[r]);
  } else {
    const d = Math.floor(r / 10);
    const u = r % 10;
    partes.push(u ? `${DECENAS[d]} Y ${UNIDADES[u]}` : DECENAS[d]);
  }
  return partes.join(' ');
}

function enLetras(n: number): string {
  if (n === 0) return 'CERO';
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (miles) partes.push(miles === 1 ? 'MIL' : `${enLetras(miles).replace(/\bUN$/, 'UN')} MIL`);
  if (resto) partes.push(centenas(resto));
  return partes.join(' ');
}

export function montoEnLetras(monto: number): string {
  const total = Math.round(Number(monto || 0) * 100);
  const enteros = Math.floor(total / 100);
  const centimos = String(total % 100).padStart(2, '0');
  const letras = `${enLetras(enteros)} CON ${centimos}/100 SOLES`;
  return letras.replace(/VEINTIUNO( MIL| CON)/, 'VEINTIÚN$1');
}

export function logoEnGrises(logo: string | null): Promise<string | null> {
  if (!logo) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const lado = 240;
        const canvas = document.createElement('canvas');
        canvas.width = lado;
        canvas.height = lado;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(logo); return; }
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, lado, lado);
        const escala = Math.min(lado / img.width, lado / img.height);
        const w = img.width * escala;
        const h = img.height * escala;
        ctx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
        const datos = ctx.getImageData(0, 0, lado, lado);
        const px = datos.data;
        for (let i = 0; i < px.length; i += 4) {
          const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          const v = g < 140 ? 0 : g > 215 ? 255 : (g - 140) * (255 / 75);
          px[i] = px[i + 1] = px[i + 2] = v;
        }
        ctx.putImageData(datos, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(logo);
      }
    };
    img.onerror = () => resolve(null);
    img.src = logo;
  });
}

const dinero = (v: any) => Number(v || 0).toFixed(2);

function fechaHora(venta: any): { fecha: string; hora: string } {
  const bruto = venta?.fecha_venta || venta?.fecha || '';
  const d = bruto ? new Date(bruto) : new Date();
  const f = isNaN(d.getTime()) ? new Date() : d;
  const p = (n: number) => String(n).padStart(2, '0');
  return { fecha: `${p(f.getDate())}/${p(f.getMonth() + 1)}/${f.getFullYear()}`, hora: `${p(f.getHours())}:${p(f.getMinutes())}` };
}

function totales(venta: any, detalles: any[]) {
  const total = Number(venta?.total_venta ?? detalles.reduce((s, d) => s + Number(d.precioUnitario || 0) * Number(d.cantidad || 0), 0));
  const tieneDesglose = venta?.opGravada != null || venta?.igv != null;
  const gravada = tieneDesglose ? Number(venta.opGravada || 0) : total / 1.18;
  const inafecta = Number(venta?.opInafecta || 0);
  const igv = tieneDesglose ? Number(venta.igv || 0) : total - gravada;
  return { total, gravada, inafecta, igv };
}

function nombreCliente(c: any): string {
  return `${c?.nombre || ''} ${c?.apellidos || ''}`.trim() || 'CLIENTES VARIOS';
}

function unidadDe(d: any): string {
  return String(d.presentacion?.nombre || d.producto?.unidadMedida?.codigo || d.producto?.unidadMedida?.nombre || 'UND').toUpperCase().slice(0, 8);
}

export function generarBoleta(datos: DatosComprobante): jsPDF {
  const { empresa, venta, detalles } = datos;
  const ancho = 80;
  const margen = 4;
  const util = ancho - margen * 2;
  const alto = 150 + detalles.length * 9;
  const doc = new jsPDF({ unit: 'mm', format: [ancho, alto] });
  const centro = ancho / 2;
  let y = 8;

  const linea = () => {
    doc.setLineDashPattern([0.6, 0.8], 0);
    doc.setLineWidth(0.2);
    doc.line(margen, y, ancho - margen, y);
    doc.setLineDashPattern([], 0);
    y += 3.5;
  };
  const centrado = (t: string, size = 8, estilo: 'normal' | 'bold' = 'normal') => {
    doc.setFont('courier', estilo);
    doc.setFontSize(size);
    const partes = doc.splitTextToSize(t, util) as string[];
    partes.forEach(p => { doc.text(p, centro, y, { align: 'center' }); y += size * 0.45; });
  };
  const fila = (izq: string, der: string, size = 8, estilo: 'normal' | 'bold' = 'normal') => {
    doc.setFont('courier', estilo);
    doc.setFontSize(size);
    doc.text(izq, margen, y);
    doc.text(der, ancho - margen, y, { align: 'right' });
    y += size * 0.45;
  };

  if (datos.logo) {
    try { doc.addImage(datos.logo, 'PNG', centro - 10, y - 3, 20, 20); y += 25; } catch { }
  }
  centrado((empresa.razonsocial || empresa.nombreComercial || 'MINIMARKET').toUpperCase(), 10, 'bold');
  if (empresa.nombreComercial && empresa.razonsocial && empresa.nombreComercial !== empresa.razonsocial) centrado(empresa.nombreComercial, 8);
  centrado(`RUC: ${empresa.ruc || '-'}`, 8, 'bold');
  if (empresa.direccion) centrado(empresa.direccion, 7.5);
  if (empresa.telefono) centrado(`Tel: ${empresa.telefono}`, 7.5);
  y += 1.5;
  linea();

  centrado('BOLETA DE VENTA ELECTRÓNICA', 9, 'bold');
  centrado(venta.nro_comrprobante || '-', 10, 'bold');
  linea();

  const { fecha, hora } = fechaHora(venta);
  const cliente = venta.cliente || {};
  fila('FECHA:', fecha, 8);
  fila('HORA:', hora, 8);
  const doc1 = String(cliente.documento || '').trim();
  const esGenerico = !doc1 || /^0+$/.test(doc1);
  fila(doc1.length === 11 ? 'RUC:' : 'DNI:', esGenerico ? '-' : doc1, 8);
  const nom = doc.splitTextToSize(`CLIENTE: ${nombreCliente(cliente)}`, util) as string[];
  nom.forEach(t => { doc.text(t, margen, y); y += 3.6; });
  if (venta.metodoPago?.nombre || venta.metodo_pago?.nombre) fila('PAGO:', String(venta.metodoPago?.nombre || venta.metodo_pago?.nombre).toUpperCase(), 8);
  y += 1;
  linea();

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('CANT', margen, y);
  doc.text('DESCRIPCIÓN', margen + 9, y);
  doc.text('IMPORTE', ancho - margen, y, { align: 'right' });
  y += 3.2;
  linea();

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  detalles.forEach(d => {
    const cant = Number(d.cantidad || 0);
    const pu = Number(d.precioUnitario || 0);
    const nombre = String(d.producto?.nombre || 'Producto');
    const lineas = doc.splitTextToSize(nombre, util - 9 - 17) as string[];
    doc.text(String(Number(cant.toFixed(3))), margen, y);
    doc.text(lineas[0], margen + 9, y);
    doc.text(dinero(cant * pu), ancho - margen, y, { align: 'right' });
    y += 3.3;
    for (let i = 1; i < lineas.length; i++) { doc.text(lineas[i], margen + 9, y); y += 3.3; }
    doc.setTextColor(110);
    doc.text(`${unidadDe(d)} x ${dinero(pu)}`, margen + 9, y);
    doc.setTextColor(0);
    y += 3.9;
  });
  linea();

  const t = totales(venta, detalles);
  fila('OP. GRAVADA', `S/ ${dinero(t.gravada)}`, 8);
  if (t.inafecta) fila('OP. INAFECTA', `S/ ${dinero(t.inafecta)}`, 8);
  fila('IGV (18%)', `S/ ${dinero(t.igv)}`, 8);
  y += 1;
  fila('TOTAL A PAGAR', `S/ ${dinero(t.total)}`, 11, 'bold');
  y += 2;
  centrado(`SON: ${montoEnLetras(t.total)}`, 7.5);
  y += 1;
  linea();

  centrado('Representación impresa de la', 7);
  centrado('Boleta de Venta Electrónica', 7);
  y += 2;
  centrado('¡GRACIAS POR SU COMPRA!', 9, 'bold');
  centrado('Vuelva pronto', 7.5);

  return doc;
}

export function generarFactura(datos: DatosComprobante): jsPDF {
  const { empresa, venta, detalles } = datos;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 12;
  const verde: [number, number, number] = [30, 41, 59];
  const cliente = venta.cliente || {};
  const { fecha } = fechaHora(venta);
  const t = totales(venta, detalles);

  let x = M;
  if (datos.logo) {
    try { doc.addImage(datos.logo, 'PNG', M, 12, 26, 26); x = M + 31; } catch { }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const razon = doc.splitTextToSize((empresa.razonsocial || empresa.nombreComercial || 'EMPRESA').toUpperCase(), 100 - (x - M)) as string[];
  let y = 17;
  razon.forEach(r => { doc.text(r, x, y); y += 5.5; });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70);
  const datosEmpresa = [
    empresa.direccion ? `Dirección: ${empresa.direccion}` : '',
    [empresa.ciudad, empresa.departamento].filter(Boolean).join(' - '),
    empresa.telefono ? `Teléfono: ${empresa.telefono}` : '',
    empresa.correo || empresa.email ? `Correo: ${empresa.correo || empresa.email}` : ''
  ].filter(Boolean);
  datosEmpresa.forEach(l => {
    (doc.splitTextToSize(l, 100 - (x - M)) as string[]).forEach(p => { doc.text(p, x, y); y += 4; });
  });
  doc.setTextColor(0);

  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.rect(W - M - 68, 12, 68, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`R.U.C. ${empresa.ruc || '-'}`, W - M - 34, 21, { align: 'center' });
  doc.setFillColor(...verde);
  doc.rect(W - M - 68, 25, 68, 9, 'F');
  doc.setTextColor(255);
  doc.setFontSize(10.5);
  doc.text('FACTURA ELECTRÓNICA', W - M - 34, 31, { align: 'center' });
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(venta.nro_comrprobante || '-', W - M - 34, 42, { align: 'center' });

  const yCli = Math.max(y, 50) + 2;
  const filas: [string, string][] = [
    ['Señor(es)', nombreCliente(cliente)],
    ['RUC', String(cliente.documento || '-')],
    ['Dirección', cliente.direccion || '-'],
    ['Fecha de emisión', fecha],
    ['Moneda', 'SOLES'],
    ['Condición de pago', venta.condicion_pago || 'Contado']
  ];
  autoTable(doc, {
    startY: yCli,
    body: filas,
    theme: 'plain',
    margin: { left: M, right: M },
    styles: { fontSize: 9, cellPadding: { top: 1.3, bottom: 1.3, left: 3, right: 3 }, textColor: 20 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 } },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.3
  });

  const yTabla = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: yTabla,
    head: [['CANT.', 'UNIDAD', 'CÓDIGO', 'DESCRIPCIÓN', 'V. UNITARIO', 'IMPORTE']],
    body: detalles.map(d => {
      const cant = Number(d.cantidad || 0);
      const pu = Number(d.precioUnitario || 0);
      return [String(Number(cant.toFixed(3))), unidadDe(d), d.producto?.codigo || '-', d.producto?.nombre || 'Producto', dinero(pu), dinero(cant * pu)];
    }),
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: 20 },
    headStyles: { fillColor: verde, textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 16 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 24 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 26 }
    }
  });

  let yFin = (doc as any).lastAutoTable.finalY + 4;
  if (yFin > 235) { doc.addPage(); yFin = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SON:', M, yFin + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(montoEnLetras(t.total), M + 10, yFin + 4);

  autoTable(doc, {
    startY: yFin + 8,
    body: [
      ['Op. Gravada', `S/ ${dinero(t.gravada)}`],
      ['Op. Inafecta', `S/ ${dinero(t.inafecta)}`],
      ['Op. Exonerada', 'S/ 0.00'],
      ['IGV (18%)', `S/ ${dinero(t.igv)}`],
      ['IMPORTE TOTAL', `S/ ${dinero(t.total)}`]
    ],
    margin: { left: W - M - 70, right: M },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 1.8, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: 20 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 36 }, 1: { halign: 'right' } },
    didParseCell: (h: any) => {
      if (h.row.index === 4) { h.cell.styles.fontStyle = 'bold'; h.cell.styles.fillColor = [226, 232, 240]; }
    }
  });

  const alto = doc.internal.pageSize.getHeight();
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  doc.line(M, alto - 20, W - M, alto - 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text('Representación impresa de la Factura Electrónica.', W / 2, alto - 14, { align: 'center' });
  doc.text('Consulte su comprobante en www.sunat.gob.pe', W / 2, alto - 10, { align: 'center' });

  return doc;
}
