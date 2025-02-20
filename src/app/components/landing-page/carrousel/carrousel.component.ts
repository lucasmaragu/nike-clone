import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-carrousel',
  imports: [],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.css'
})
export class CarrouselComponent {
  @Input() title: string = '';
  @Input() products: { src: string, alt: string, title: string }[] = [];
}
