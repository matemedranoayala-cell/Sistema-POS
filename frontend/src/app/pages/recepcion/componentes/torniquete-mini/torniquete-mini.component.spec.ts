import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorniqueteMiniComponent } from './torniquete-mini.component';

describe('TorniqueteMiniComponent', () => {
  let component: TorniqueteMiniComponent;
  let fixture: ComponentFixture<TorniqueteMiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorniqueteMiniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorniqueteMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
