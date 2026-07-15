import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabHeader } from './tab-header';

describe('TabHeader', () => {
  let component: TabHeader;
  let fixture: ComponentFixture<TabHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
