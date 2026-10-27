import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterDataService {
  private filterData = new BehaviorSubject<any>(undefined);

  FilterData$ = this.filterData.asObservable();

  updateFilter(event: any): void {
    this.filterData.next(event);
  }
}