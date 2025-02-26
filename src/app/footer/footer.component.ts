import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  filasFooter = [
    {
      titulo: 'Recursos',
      palabras: [
        'Tarjetas de regalo',
        'Tarjetas de regalo corporativas',
        'Buscar una tienda',
        'Nike Journal',
        'Hazte Member',
        'Descuento para estudiantes',
        'Comentarios',
        'Códigos promocionales'
      ]
    },
    {
      titulo: 'Ayuda',
      palabras: [
        'Obtener ayuda',
        'Estado del pedido',
        'Envíos y entregas',
        'Devoluciones',
        'Opciones de pago',
        'Contacto',
        'Evaluaciones',
        'Ayuda con los códigos promocionales de Nike'
      ]
    },
    {
      titulo: 'Empresa',
      palabras: [
        'Acerca de Nike',
        'Novedades',
        'Empleo',
        'Inversores',
        'Sostenibilidad',
        'Propósito',
        'Informar de un problema'
      ]
    }
  ];
  footerText = [
    
    '© 2025 Nike, Inc. Todos los derechos reservados',
    'Guías',
    'Términos de uso',
    'Términos de venta',
    'Aviso legal',
    'Política de privacidad y cookies',
    'Configuración de privacidad y cookies',
  ];
}
