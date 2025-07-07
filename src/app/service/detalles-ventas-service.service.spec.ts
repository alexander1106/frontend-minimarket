import { TestBed } from '@angular/core/testing';

import { DetallesVentasServiceService } from './detalles-ventas-service.service';

describe('DetallesVentasServiceService', () => {
  let service: DetallesVentasServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallesVentasServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
