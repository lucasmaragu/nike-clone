import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product/product.service';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

class MockProductService {
  fetchProducts() {} // Puedes dejarlo vacío si no validas comportamiento
}

class MockCartService {
  addToCart(product: Product) {}
}

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let cartService: MockCartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SuccessModalComponent, ProductListComponent],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        { provide: CartService, useClass: MockCartService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set modal message and showModal to true when product is added', () => {
    const product: Product = {
      reference_number: 1,
      name: 'Producto test',
      description: 'Descripción',
      price: 20,
      type: 'general',
      stock: 3,
      on_sale: false,
      image_url: ''
    };

    spyOn(cartService, 'addToCart');

    component.addToCart(product);

    expect(cartService.addToCart).toHaveBeenCalledWith(product);
    expect(component.modalMessage).toBe('Producto agregado al carrito');
    expect(component.showModal).toBeTrue();
  });

  it('should show error modal if addToCart throws an error', () => {
    const product: Product = {
      reference_number: 2,
      name: 'Producto con error',
      description: 'Descripción',
      price: 15,
      type: 'general',
      stock: 2,
      on_sale: true,
      image_url: ''
    };

    spyOn(cartService, 'addToCart').and.throwError('Error al agregar al carrito');

    component.addToCart(product);

    expect(component.showModal).toBeTrue();
    expect(component.modalMessage).toBe('Error al agregar al carrito');
  });
});
