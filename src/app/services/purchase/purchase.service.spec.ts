import { TestBed } from '@angular/core/testing';

import { PurchaseService } from '../purchase/purchase.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Asegúrate de importar HttpClientModule

describe('PurchaseService', () => {
  let service: PurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Asegúrate de importar HttpClientModule
    });
    service = TestBed.inject(PurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
