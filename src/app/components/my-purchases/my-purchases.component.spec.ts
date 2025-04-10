import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  
import { MyPurchasesComponent } from './my-purchases.component';

describe('MyPurchasesComponent', () => {
  let component: MyPurchasesComponent;
  let fixture: ComponentFixture<MyPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPurchasesComponent, HttpClientModule], // Asegúrate de importar HttpClientModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
