describe('Login de usuario', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/login');
    });
  
    it('Muestra error si los campos están vacíos', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Todos los campos son obligatorios').should('be.visible');
    });
  
    it('Muestra error si las credenciales son incorrectas', () => {
      cy.get('input[formControlName="email"]').type('incorrecto@ejemplo.com');
      cy.get('input[formControlName="password"]').type('contrasenaIncorrecta');
      cy.get('button[type="submit"]').click();
  
      cy.contains('Email o contraseña incorrectos').should('be.visible');
    });
  
    it('Hace login correctamente con credenciales válidas', () => {
      cy.get('input[formControlName="email"]').type('admin@example.com'); // Usa un usuario real o de mock
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Espera redirección
      cy.url().should('eq', 'http://localhost:4200/');
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.exist;
      });
    });
  });
  