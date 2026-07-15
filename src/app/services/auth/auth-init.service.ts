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
      // 1) renova tokens (caso access tenha expirado)
      await firstValueFrom(this.userService.refresh());
      console.log("Refresh OK");

      // 2) pega o usuário e guarda
      this.currentUser = await firstValueFrom(this.userService.getProfile());
      console.log("Usuário restaurado:", this.currentUser);

      return true;
    } catch (err) {
      console.warn("Nenhum usuário logado.");
      this.currentUser = null;
      return false;
    }
  }
}
