import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recomendacoes } from './recomendacoes';

describe('Recomendacoes', () => {
  let component: Recomendacoes;
  let fixture: ComponentFixture<Recomendacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recomendacoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recomendacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
