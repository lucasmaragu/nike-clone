import { Component, ViewChild, AfterViewInit, AfterViewChecked } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors  } from "@angular/forms";
import { createClient } from "@supabase/supabase-js";
import { CommonModule } from '@angular/common';
import { SuccessModalComponent } from "../components/success-modal/success-modal.component";
import { ProductService } from "../services/product/product.service";
import { Product } from "../models/product";
import { of } from 'rxjs'; 
import { map, catchError, debounceTime, switchMap } from "rxjs/operators";
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

  newProduct: Product = { reference_number: "", name: "", price: 0, type: "", description: "", image_url: "", on_sale: false };

  imageUrl: string | null = null;
  selectedFile!: File | null;
  formSubmitted = false;
  showModal = false;
  productTypes = ["Footwear", "Apparel", "Equipment", "Accessories"];

  AdminForm = new FormGroup({
    ReferenceNumber: new FormControl("", [Validators.required, Validators.minLength(3)]),
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
    Price: new FormControl("", [
      Validators.required,
      Validators.min(0),
      Validators.max(10000) // Asumiendo un precio máximo de 10,000
    ]),
    Type: new FormControl("", [Validators.required]),
    OnSale: new FormControl(false),
  });

  nameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(300), // Opcional: esperar 300ms antes de realizar la validación
      switchMap(async (name: string) => {
        const products = await this.productService.getProducts(); // Llamar al servicio para obtener productos
        const existingProduct = products.find((p) => p.name === name);
        return existingProduct ? { nameTaken: true } : null;
      }),
      catchError(() => of(null)) // Maneja cualquier error de manera segura
    );
  }


  async onSubmit() {
    this.formSubmitted = true;

    if (this.AdminForm.valid) {
      if (this.selectedFile) {
        await this.uploadImage();
      }

      const formData = {
        reference_number: this.AdminForm.value.ReferenceNumber || "",
        name: this.AdminForm.value.Name || "",
        price: this.AdminForm.value.Price ? parseFloat(this.AdminForm.value.Price) : 0,
        type: this.AdminForm.value.Type || "",
        description: this.AdminForm.value.Description || "",
        image_url: this.imageUrl || "",
        on_sale: this.AdminForm.value.OnSale ?? false,
      };
      await this.productService.addProduct(formData);

      this.showModal = true;

   
      console.log("Formulario válido:", formData);

      // Resetear el formulario
      this.AdminForm.reset();
      this.imageUrl = null;
      this.selectedFile = null;

      // Después de resetear, asegúrate de marcar los controles como "untouched" y "pristine"
      Object.values(this.AdminForm.controls).forEach((control) => {
        control.markAsPristine();
        control.markAsUntouched();
      });
      this.formSubmitted = false;


    } else {
      console.log("Error en el formulario");
      console.log(this.AdminForm.value);  
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

    // Validar que el archivo sea una imagen
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato de imagen no válido. Solo se permiten JPG y PNG.");
      return;
    }

    // Mostrar vista previa de la imagen
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

      // Guardar la URL pública de la imagen
      this.imageUrl = `https://gbgjfcnjjmkocjzjaclk.supabase.co/storage/v1/object/public/products/${data.path}`;
      console.log("Imagen subida con éxito:", this.imageUrl);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }
}
