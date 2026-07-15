import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMaterial } from './view-material';

describe('ViewMaterial', () => {
  let component: ViewMaterial;
  let fixture: ComponentFixture<ViewMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
