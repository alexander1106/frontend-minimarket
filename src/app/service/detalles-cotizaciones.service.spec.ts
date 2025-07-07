import { TestBed } from '@angular/core/testing';

import { DetallesCotizacionesService } from './detalles-cotizaciones.service';

describe('DetallesCotizacionesService', () => {
  let service: DetallesCotizacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallesCotizacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
