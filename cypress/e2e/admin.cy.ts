describe('Añadir nuevo producto como administrador', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/login');
      
        // Login como admin
        cy.get('input[formControlName="email"]').type('admin@example.com');
        cy.get('input[formControlName="password"]').type('password123');
        cy.get('button[type="submit"]').click();
      
        cy.visit('http://localhost:4200/admin');
      
        // Asegurarse de estar en /admin
        cy.url().should('include', '/admin');
      });
      
  
    it('debería añadir un nuevo producto correctamente', () => {
      // Rellenar el formulario
      cy.get('input[formControlName="ReferenceNumber"]').clear().type('99999');
      cy.get('input[formControlName="Name"]').clear().type('Producto Test Cypress');
      cy.get('textarea[formControlName="Description"]').clear().type('Este es un producto de prueba generado por Cypress');
      cy.get('input[formControlName="Price"]').clear().type('99.99');
      cy.get('select[formControlName="Type"]').select('Footwear');
      cy.get('input[formControlName="OnSale"]').check();
      cy.get('input[formControlName="Stock"]').clear().type('15');
  
      // Subir imagen
      const imagePath = 'testImages/test-product.jpg';
      cy.get('input[type="file"]').selectFile(`cypress/fixtures/${imagePath}`, { force: true });
  
      // Enviar el formulario
      cy.get('form').submit();
  
      // Verificar modal de éxito
      cy.contains('Producto agregado con éxito').should('be.visible');
    });
  });
  