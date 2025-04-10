import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product/product.service';
import { CartService } from '../../services/cart/cart.service';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { HttpClientModule } from '@angular/common/http';  




describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SuccessModalComponent, ProductListComponent,HttpClientModule ],
      providers: [
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial modalMessage as empty and showModal as false', () => {
    expect(component.modalMessage).toBe('');
    expect(component.showModal).toBeFalse();
  });

  it('should set modalMessage and showModal correctly after addToCart is called', () => {
    const dummyProduct: Product = {
      reference_number: 1,
      name: 'Test Product',
      description: 'Desc',
      price: 10,
      type: 'Zapatillas',
      stock: 1,
      on_sale: false,
      image_url: ''
    };
  
    component.addToCart(dummyProduct);
  
    expect(component.showModal).toBeTrue();
    expect(component.modalMessage).toBe('Producto agregado al carrito');
  });
  
  it('should show error modal if cartService.addToCart throws an error', () => {
    const dummyProduct: Product = {
      reference_number: 456,
      name: 'Error Product',
      description: 'Error desc',
      price: 20,
      type: 'Zapatillas',
      stock: 2,
      on_sale: false,
      image_url: ''
    };
  
    spyOn(component.cartService, 'addToCart').and.throwError('Error al agregar al carrito');
  
    component.addToCart(dummyProduct);
  
    expect(component.showModal).toBeTrue();

  });
});
