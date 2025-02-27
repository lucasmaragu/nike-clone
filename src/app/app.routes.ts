import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AdminComponent } from './admin/admin.component';
import { ProductListComponent } from './product-list/product-list.component';


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'admin', component: AdminComponent},
    {path: 'productos', component: ProductListComponent},
];
