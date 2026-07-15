import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materiais } from './materiais';

describe('Materiais', () => {
  let component: Materiais;
  let fixture: ComponentFixture<Materiais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materiais]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Materiais);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
