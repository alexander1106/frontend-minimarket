import { TestBed } from '@angular/core/testing';

import { ArqueoCajaServiceService } from './arqueo-caja-service.service';

describe('ArqueoCajaServiceService', () => {
  let service: ArqueoCajaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArqueoCajaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
