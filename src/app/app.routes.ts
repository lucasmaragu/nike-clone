import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AdminComponent } from './admin/admin.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';   


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'admin', component: AdminComponent},
    {path: 'productos', component: ProductListComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},

];
