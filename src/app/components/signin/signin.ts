// angular
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// services
import { UserService } from '../../services/users/users.service';

// components
import { AccessHeaderDesktop } from '../accessheader-desktop/accessheader-desktop';
import { AccessHeaderMobile } from '../accessheader-mobile/accessheader-mobile';

// class
import { RouterButton } from '../../classes/routerbuttonclass'

@Component({
  selector: 'app-signin',
  imports: [
    MatFormFieldModule
    , MatInputModule
    , MatIconModule
    , FormsModule
    , CommonModule
    , AccessHeaderDesktop
    , AccessHeaderMobile
  ],
  // templateUrl: './signin.html',
  styleUrl: './signin.scss',
  templateUrl: './signin.html'
})
export class Signin {
  userName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  mobile: boolean = window.innerWidth <= 768;

  headerConfig: RouterButton = {
    buttonText: 'ENTRAR', 
    buttonRoute: '/login', 
    sideTitle: 'Bem vindo de volta!', 
    sideSubtitle: 'Já possui cadastro? Entre na sua conta'
  };

  constructor(
    private router: Router,
    private userService: UserService
  ) {}


  @HostListener('window:resize')
  onResize() {
    this.mobile = window.innerWidth <= 768;
  }

  togglePassword(isConfirmPassword: boolean) {
    if (isConfirmPassword)
      this.hideConfirmPassword = !this.hideConfirmPassword;
    else
      this.hidePassword = !this.hidePassword;
  }

  onRegister() {
    if (this.password !== this.confirmPassword) {
      alert ("Os campos de 'senha' e 'confirmar senha' estão com valores diferentes");
      return;
    }

    const userData = { user_name: this.userName, email: this.email, password: this.password };

    this.userService.register(userData).subscribe({
      next: (res) => {
        this.router.navigate(['/recomendacoes']);
        this.userService.updateColorBlindFilter(-1)
      },
      error: (err) => {
        console.error('Erro ao registrar:', err);
      }
    });
  }

  signIn() {
    const loginData = { email: this.email, password: this.password };

    this.userService.login(loginData).subscribe({
      next: (res) => {
        console.log('Login bem-sucedido:', res);
        this.router.navigate(['/recomendacoes']);
        this.userService.updateColorBlindFilter(-1)
      },
      error: (err) => {
        console.error('Erro ao logar:', err);
      }
    });
  }
}