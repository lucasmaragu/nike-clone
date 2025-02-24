import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-landing-footer',
  imports: [],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.css'
})
export class LandingFooterComponent {
  @Input() filas: { titulo: string, palabras: string[] }[] = [];
}
