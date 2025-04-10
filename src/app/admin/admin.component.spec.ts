import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';
import { ProductService } from '../services/product/product.service';
import { Product } from '../models/product';
import { on } from 'events';
import { HttpClientModule } from '@angular/common/http';  // Asegúrate de importar HttpClientModule


describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent, ReactiveFormsModule, HttpClientModule],
      providers: [ProductService],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form with default values', () => {
    expect(component.AdminForm).toBeTruthy();
    expect(component.AdminForm.get('ReferenceNumber')?.value).toBe(0);
    expect(component.AdminForm.get('Name')?.value).toBe("");
    expect(component.AdminForm.get('Description')?.value).toBe("");
    expect(component.AdminForm.get('Price')?.value).toBe(0);
    expect(component.AdminForm.get('Type')?.value).toBe("");
    expect(component.AdminForm.get('OnSale')?.value).toBe(false);
    expect(component.AdminForm.get('Stock')?.value).toBe(0);
  });

  it('should call getProducts and update form values on reference number change', async () => {
    const mockResponse: Product[] = [{ 
      reference_number: 123, 
      name: 'Test Product', 
      price: 100, 
      type: 'Footwear', 
      description: 'Description', 
      stock: 10, 
      on_sale: true, 
      image_url: '' 
    }];
  
    // Simula la respuesta del método getProducts
    const spy = spyOn(component.productServicePublic, 'getProducts').and.returnValue(await Promise.resolve(mockResponse));
  
    // Simula el cambio de referencia
    const event = { target: { value: '123' } };
  
    // Asegúrate de esperar que se resuelva la promesa
    await component.onReferenceNumberChange(event as any);
  
    // Verifica si se llamó al servicio y si los valores en el formulario fueron actualizados
    expect(spy).toHaveBeenCalled();
    expect(component.AdminForm.get('Name')?.value).toBe('Test Product');
    expect(component.AdminForm.get('Price')?.value).toBe(100);
  });

  it('should call updateProduct when form is valid and product is in edit mode', async () => {
    component.isEditMode = true;
    spyOn(component.productServicePublic, 'updateProduct').and.returnValue(Promise.resolve());
    component.AdminForm.setValue({
      ReferenceNumber: 123,
      Name: 'Updated Product',
      Price: 200,
      Type: 'Apparel',
      Description: 'Updated product description',
      OnSale: true,
      Stock: 5
    });
  
    await component.onSubmit();
  
    expect(component.productServicePublic.updateProduct).toHaveBeenCalled();
    expect(component.showModal).toBeTrue();
    expect(component.modalMessage).toBe('Producto actualizado con éxito');
  });
  
  
});
