import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataBridgeService {
  private userDataSubject = new BehaviorSubject<any>(undefined);

  userData$ = this.userDataSubject.asObservable();

  updateTabProgressData(userData: any): void {
    this.userDataSubject.next(userData);
  }
}