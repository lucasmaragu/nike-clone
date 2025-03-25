import { Component} from "@angular/core";
import { FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors  } from "@angular/forms";
import { createClient } from "@supabase/supabase-js";
import { CommonModule } from '@angular/common';
import { SuccessModalComponent } from "../components/success-modal/success-modal.component";
import { ProductService } from "../services/product/product.service";
import { Product } from "../models/product";
import { of } from 'rxjs'; 
import { catchError, debounceTime, switchMap } from "rxjs/operators";
import { Observable } from "rxjs";


@Component({
  selector: "app-admin",
  standalone: true,
  templateUrl: "./admin.component.html",
  imports: [CommonModule, ReactiveFormsModule, SuccessModalComponent],
})
export class AdminComponent  {

  constructor(private productService: ProductService) {}

  private supabase = createClient(
    "https://gbgjfcnjjmkocjzjaclk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZ2pmY25qam1rb2NqemphY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1OTU2MDUsImV4cCI6MjA1NjE3MTYwNX0.1N1qA6a57xUeq2Hzd1NC_XYZeltugLUzK5mU-DcxiT8"
  );

  newProduct: Product = { reference_number: 0, name: "", price: 0, type: "", description: "", image_url: "", on_sale: false, stock: 0 };
  imageUrl: string | null | undefined = null;
  selectedFile!: File | null;
  Price: number = 0;
  formSubmitted = false;
  showModal = false;
  modalMessage: string = "";  
  productTypes = ["Footwear", "Apparel", "Equipment", "Accessories"];
  isEditMode = false;
  currentProductId: string | null = null;

  AdminForm = new FormGroup({
    ReferenceNumber: new FormControl(0, [Validators.required, Validators.minLength(3)]),
    Name: new FormControl("", [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ], [this.nameValidator.bind(this)]),
    Description: new FormControl("", [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(200)
    ]),
    Price: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(10000) // Asumiendo un precio máximo de 10,000
    ]),
    Type: new FormControl("", [Validators.required]),
    OnSale: new FormControl(false),
    Stock: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  async onReferenceNumberChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim(); // Eliminamos espacios extra
    
    try {
      const products = await this.productService.getProducts(); // Obtener productos
      const matchedProduct = products.find(product => product.reference_number === Number(value)); // Buscar coincidencia
      console.log("ReferenceNumber of all products:", products.map(p => p.reference_number));
      console.log("Mi input es:", value);
      if (matchedProduct) {
        this.isEditMode = true;
        this.AdminForm.patchValue({
          ReferenceNumber: matchedProduct.reference_number,
          Name: matchedProduct.name,
          Price: matchedProduct.price,
          Type: matchedProduct.type,
          Description: matchedProduct.description,
          Stock: matchedProduct.stock,
          OnSale: matchedProduct.on_sale,
        });
        this.imageUrl = matchedProduct.image_url;
      } else {
        console.log("No se encontró ningún producto con ese número de referencia.");
      }
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    }
  }
  
  nameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    // Solo validamos el nombre si no estamos en modo edición
    if (this.isEditMode) {
      return of(null); // Sin validación si está en modo edición
    }
    
    return of(control.value).pipe(
      debounceTime(300),
      switchMap(async (name: string) => {
        if (!name) return null; // Skip validation if name is empty
        
        const products = await this.productService.getProducts();
        
        const nameExists = products.some(p => p.name === name);
        
        return nameExists ? { nameTaken: true } : null;
      }),
      catchError(() => of(null)) // Si ocurre algún error, no afecta a la validación
    );
  }

  async onSubmit() {
    this.formSubmitted = true;

    if (this.AdminForm.valid) {
      if (this.selectedFile) {
        await this.uploadImage();
      }

      const formData = {
        reference_number: this.AdminForm.value.ReferenceNumber ?? 0,
        name: this.AdminForm.value.Name ?? "",
        price: this.AdminForm.value.Price ?? 0,
        type: this.AdminForm.value.Type ?? "",
        description: this.AdminForm.value.Description ?? "",
        image_url: this.imageUrl ?? "null",
        on_sale: this.AdminForm.value.OnSale ?? false,
        stock: this.AdminForm.value.Stock ?? 0,
      };

      if (this.isEditMode && this.AdminForm.value.ReferenceNumber) {
        await this.productService.updateProduct(this.AdminForm.value.ReferenceNumber, formData);
        this.modalMessage = 'Producto actualizado con éxito';
      } else {
        await this.productService.createProduct(formData);
        this.modalMessage = 'Producto agregado con éxito';
      }

      this.showModal = true;

      this.AdminForm.reset();
      this.imageUrl = null;
      this.selectedFile = null;
      this.isEditMode = false;
      

      Object.values(this.AdminForm.controls).forEach((control) => {
        control.markAsPristine();
        control.markAsUntouched();
      });
      this.formSubmitted = false;
    } else {
      console.log("Error en el formulario", this.AdminForm);
      this.markFormGroupTouched(this.AdminForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  shouldShowError(controlName: string): boolean {
    const control = this.AdminForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty || this.formSubmitted));
  }

  async onImageChange(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato de imagen no válido. Solo se permiten JPG y PNG.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    this.selectedFile = file;
  }

  async uploadImage() {
    if (!this.selectedFile) {
      alert("Por favor, selecciona una imagen antes de enviar el formulario.");
      return;
    }

    try {
      const filePath = `products/${this.selectedFile.name}`;
      const { data, error } = await this.supabase.storage
        .from("products")
        .upload(filePath, this.selectedFile, { upsert: true });

      if (error) throw error;

      this.imageUrl = `https://gbgjfcnjjmkocjzjaclk.supabase.co/storage/v1/object/public/products/${data.path}`;
      console.log("Imagen subida con éxito:", this.imageUrl);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }

  deleteProduct() {
    const referenceNumber = this.AdminForm.value.ReferenceNumber;
  
    // Verificar que el referenceNumber es un número válido
    const referenceNumberAsNumber = Number(referenceNumber);
  
    if (!isNaN(referenceNumberAsNumber)) {
      // Llamar al servicio de eliminación pasándole el número convertido
      this.productService.deleteProduct(referenceNumberAsNumber);
    } else {
      console.error('ReferenceNumber no es válido');
    }
  }
  
  
}
