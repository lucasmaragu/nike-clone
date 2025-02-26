import { Component } from "@angular/core"
import { type FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { FormControl } from "@angular/forms"

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./admin.component.html",
})
export class AdminComponent {

  formSubmitted = false
  productTypes = ["Footwear", "Apparel", "Equipment", "Accessories"]
  
  AdminForm = new FormGroup({
    ReferenceNumber: new FormControl("", [Validators.required, Validators.minLength(3)]),
    Name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    Description: new FormControl("", [Validators.required, Validators.minLength(3)]),
    Price: new FormControl("", [Validators.required, Validators.min(0)]),
    Type: new FormControl("", [Validators.required]),
    OnSale: new FormControl(false),
    Image: new FormControl("", [Validators.required]),
  })


  onSubmit() {
    this.formSubmitted = true
    if (this.AdminForm.valid) {
      console.log(this.AdminForm.value)
    } else {
      console.log("Error en el formulario")
      this.markFormGroupTouched(this.AdminForm)
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  shouldShowError(controlName: string): boolean {
    const control = this.AdminForm.get(controlName)
    return !!(control && control.invalid && (control.touched || this.formSubmitted))
  }
}

