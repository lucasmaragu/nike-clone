import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from "@angular/forms";
import { createClient } from "@supabase/supabase-js";
import { CommonModule } from '@angular/common';
import { SuccessModalComponent } from "../components/success-modal/success-modal.component";

@Component({
  selector: "app-admin",
  standalone: true,
  templateUrl: "./admin.component.html",
  imports: [CommonModule, ReactiveFormsModule, SuccessModalComponent],
})
export class AdminComponent {
  private supabase = createClient(
    "https://gbgjfcnjjmkocjzjaclk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZ2pmY25qam1rb2NqemphY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1OTU2MDUsImV4cCI6MjA1NjE3MTYwNX0.1N1qA6a57xUeq2Hzd1NC_XYZeltugLUzK5mU-DcxiT8"
  );

  imageUrl: string | null = null;
  selectedFile!: File | null;
  formSubmitted = false;
  showModal = false;
  productTypes = ["Footwear", "Apparel", "Equipment", "Accessories"];

  AdminForm = new FormGroup({
    ReferenceNumber: new FormControl("", [Validators.required, Validators.minLength(3)]),
    Name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    Description: new FormControl("", [Validators.required, Validators.minLength(10)]),
    Price: new FormControl("", [Validators.required, Validators.min(0)]),
    Type: new FormControl("", [Validators.required]),
    OnSale: new FormControl(false),
  
  });

  async onSubmit() {
    this.formSubmitted = true;
  
    if (this.AdminForm.valid) {
      if (this.selectedFile) {
        await this.uploadImage();
      }
  
      const formData = {
        ...this.AdminForm.value,
        ImageUrl: this.imageUrl || null,  
      };
  
      console.log("Formulario enviado:", formData);
  
      this.showModal = true;
  
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
