import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"; // Asegúrate de que esta línea esté correcta
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ProfileService, ProfileUpdateRequest, PasswordUpdateRequest } from "../../services/profile/profile.service";
import { MyPurchasesComponent } from "../my-purchases/my-purchases.component"; // Asegúrate de que esta importación también sea correcta

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MyPurchasesComponent],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup
  passwordForm!: FormGroup

  activeTab = signal("profile")
  purchases = signal<any[]>([])

  constructor(
    private fb: FormBuilder,
    public profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.initForms()
    this.loadUserProfile()
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      role: ["", [Validators.required]],
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get("newPassword")?.value
    const confirmPassword = form.get("confirmPassword")?.value

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true }
    }

    return null
  }

  loadUserProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (user) => {
        // Actualizar el formulario con los datos del usuario
        this.profileForm.patchValue({
          email: user.email,
          role: user.role,
        })
      },
      error: (err) => {
        console.error("Error al cargar el perfil", err)
      },
    })
  }

  updateProfile(): void {
   
    console.log(this.profileForm.value)
    const profileData: ProfileUpdateRequest = {
      email: this.profileForm.value.email,
      role: this.profileForm.value.role,
    }

    this.profileService.updateProfile(profileData).subscribe()
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      return
    }

    const passwordData: PasswordUpdateRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    }

    this.profileService.updatePassword(passwordData).subscribe({
      next: () => {
        this.passwordForm.reset()
      },
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab)

    if (tab === "purchases" && this.purchases().length === 0) {
      this.loadPurchases()
    }
  }

  loadPurchases(): void {
    this.profileService.getPurchases().subscribe({
      next: (purchases) => {
        this.purchases.set(purchases)
      },
    })
  }

  getTotalItems(purchase: any): number {
    // Esta función debe implementarse según la estructura de tus datos
    return purchase.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
  }
}

