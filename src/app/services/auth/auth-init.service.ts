import { Injectable } from '@angular/core';
import { UserService } from '../users/users.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInitService {

  public currentUser: any = null;

  constructor(private userService: UserService) {}

  async restoreSession() {
    try {
      await firstValueFrom(this.userService.refresh());

      this.currentUser = await firstValueFrom(this.userService.getProfile());

      return true;
    } catch (err: any) {
      this.currentUser = null;
      return false;
    }
  }
}
