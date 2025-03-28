import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AdminComponent } from './admin/admin.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component'; 
import { MyPurchasesComponent } from './components/my-purchases/my-purchases.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
    {path: 'productos', component: ProductListComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'carrito', component: CartComponent},
    {path: 'perfil', component: ProfileComponent},



];
