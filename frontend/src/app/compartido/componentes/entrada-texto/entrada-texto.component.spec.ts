import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntradaTextoComponent } from './entrada-texto.component';

describe('EntradaTextoComponent', () => {
  let component: EntradaTextoComponent;
  let fixture: ComponentFixture<EntradaTextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntradaTextoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntradaTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
