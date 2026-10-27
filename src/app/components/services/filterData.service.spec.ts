/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FilterDataService } from './filterData.service';

describe('Service: FilterData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterDataService]
    });
  });

  it('should ...', inject([FilterDataService], (service: FilterDataService) => {
    expect(service).toBeTruthy();
  }));
});
