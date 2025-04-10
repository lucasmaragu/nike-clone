import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    {
      reference_number: 1,
      name: 'Producto 1',
      description: 'Desc',
      price: 20,
      type: 'Zapatillas',
      stock: 3,
      on_sale: false,
      image_url: ''
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
  
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  
    const req = httpMock.expectOne('http://localhost:3000/api/products');
    req.flush({ products: [] });
  });
  

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya llamadas pendientes
  });

  it('should fetch products and update signal', () => {
    service.fetchProducts();

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    expect(req.request.method).toBe('GET');

    req.flush({ products: mockProducts });

    expect(service.productsSignal()).toEqual(mockProducts);
    expect(service.loading()).toBeFalse();
  });

  it('should handle error on fetchProducts', () => {
    service.fetchProducts();

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toBe('Error al cargar los productos');
    expect(service.loading()).toBeFalse();
  });

  it('should create a product and update signal', () => {
    const newProduct: Product = {
      reference_number: 2,
      name: 'Nuevo',
      description: '',
      price: 25,
      type: 'Gorra',
      stock: 10,
      on_sale: true,
      image_url: ''
    };

    service.createProduct(newProduct);

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    expect(req.request.method).toBe('POST');

    req.flush({ message: 'Creado', product: newProduct });

    expect(service.productsSignal()).toContain(newProduct);
    expect(service.currentProduct()).toEqual(newProduct);
    expect(service.loading()).toBeFalse();
  });

  it('should add product locally if API fails in addProduct()', () => {
    const fallbackProduct: Product = {
      reference_number: 3,
      name: 'Fallback',
      description: '',
      price: 30,
      type: 'Gafas',
      stock: 5,
      on_sale: false,
      image_url: ''
    };

    service.addProduct(fallbackProduct);

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    req.flush('Error', { status: 500, statusText: 'Fail' });

    expect(service.productsSignal()).toContain(fallbackProduct);
    expect(service.loading()).toBeFalse();
  });

  it('should delete product from signal when deleteProduct succeeds', () => {
    service.productsSignal.set(mockProducts);

    service.deleteProduct(1);

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    req.flush({ message: 'Deleted' });

    expect(service.productsSignal().length).toBe(0);
  });

  it('should remove product locally if deleteProduct fails', () => {
    service.productsSignal.set(mockProducts);

    service.deleteProduct(1);

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    req.flush('Error', { status: 500, statusText: 'Error' });

    expect(service.productsSignal().length).toBe(0);
    expect(service.error()).toBe('Error al eliminar el producto');
  });

  it('should get product by reference number from API', async () => {
    const product: Product = mockProducts[0];

    const promise = service.getProductByReferenceNumber(1);

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    req.flush(product);

    const result = await promise;
    expect(result).toEqual(product);
    expect(service.currentProduct()).toEqual(product);
  });

  it('should get product by reference number from local data if API fails', async () => {
    service.productsSignal.set(mockProducts);

    const promise = service.getProductByReferenceNumber(1);

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    req.flush('Error', { status: 500, statusText: 'Fail' });

    const result = await promise;
    expect(result).toEqual(mockProducts[0]);
  });
});
