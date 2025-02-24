import { Component } from '@angular/core';
import { CarrouselComponent } from './carrousel/carrousel.component';
import { LandingFooterComponent } from './landing-footer/landing-footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [CarrouselComponent, LandingFooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
