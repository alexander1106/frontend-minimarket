import { TestBed } from '@angular/core/testing';

import { SaldoMetodoPagoServiceService } from './saldo-metodo-pago-service.service';

describe('SaldoMetodoPagoServiceService', () => {
  let service: SaldoMetodoPagoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaldoMetodoPagoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
