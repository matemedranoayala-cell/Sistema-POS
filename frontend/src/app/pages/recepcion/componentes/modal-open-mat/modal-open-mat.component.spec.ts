import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOpenMatComponent } from './modal-open-mat.component';

describe('ModalOpenMatComponent', () => {
  let component: ModalOpenMatComponent;
  let fixture: ComponentFixture<ModalOpenMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOpenMatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOpenMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
