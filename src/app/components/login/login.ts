// angular
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatFormFieldModule} from '@angular/material/form-field';
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
  selector: 'app-login',
  imports: [
    MatFormFieldModule
    , MatInputModule
    , MatIconModule
    , FormsModule
    , CommonModule
    , AccessHeaderDesktop
    , AccessHeaderMobile
  ],
  // templateUrl: './login.html',
  styleUrl: './login.scss',
  templateUrl: './login.html'
})
export class Login implements OnInit {
  email = '';
  password = '';
  hidePassword = true;

  headerConfig: RouterButton = {buttonText: 'CADASTRAR', buttonRoute: '/signin', sideTitle: 'Bem Vindo!', sideSubtitle: 'Ainda não possui uma conta? Cadastre-se'};
  mobile: boolean = window.innerWidth <= 768;

  constructor(private router: Router, private userService: UserService) {}

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  @HostListener('window:resize')
  onResize() {
    this.mobile = window.innerWidth <= 768;
  }

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.userService.login(credentials).subscribe({
      next: (res) => {
        console.log('Login bem-sucedido:', res);
        this.router.navigate(['/recomendacoes']);
        this.userService.updateColorBlindFilter(-1)
      },
      error: (err) => {
        console.error('Erro no login:', err);
      },
    });
  }

  ngOnInit() {
    this.userService.updateColorBlindFilter(-1);
  }

  goToSignin() {
    this.router.navigate(['/signin']);
  }

}