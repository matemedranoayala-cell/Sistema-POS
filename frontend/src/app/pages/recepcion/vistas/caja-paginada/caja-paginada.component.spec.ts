import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaPaginadaComponent } from './caja-paginada.component';

describe('CajaPaginadaComponent', () => {
  let component: CajaPaginadaComponent;
  let fixture: ComponentFixture<CajaPaginadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaPaginadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaPaginadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
