// angular
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// services
import { UserService } from '../../services/users/users.service';
import { DialogService } from '../services/dialog.service'

// components
import { AccessHeaderDesktop } from '../accessheader-desktop/accessheader-desktop';
import { AccessHeaderMobile } from '../accessheader-mobile/accessheader-mobile';

// common
import { RouterButton } from '../../classes/routerbuttonclass'
import { MessageDialogConfig } from '../models/dialog.models';
import { DialogSize, DialogVariant } from '../enums/dialog.enums';

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
  bgLoaded = false;
  
  headerConfig: RouterButton = {buttonText: 'CADASTRAR', buttonRoute: '/signin', sideTitle: 'Bem Vindo!', sideSubtitle: 'Ainda não possui uma conta? Cadastre-se'};
  mobile: boolean = window.innerWidth <= 768;
  
  constructor(private router: Router
            , private userService: UserService
            , private dialogService: DialogService) {}
    
  private readonly bgUrl = '/assets/images/background_studdle.png';

  private preloadBackground(): void {
    const img = new Image();
    img.src = this.bgUrl;

    // já estava em cache: entra visível, sem piscar
    if (img.complete) {
      this.bgLoaded = true;
      return;
    }

    img.onload = () => this.bgLoaded = true;
    // se falhar, libera mesmo assim para não ficar preto para sempre
    img.onerror = () => this.bgLoaded = true;
  }

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
        if (res.ok) {
          this.router.navigate(['/recomendacoes']);
          this.userService.updateColorBlindFilter(-1);
        } else {
          const rankMessageConfig: MessageDialogConfig = {
            title: 'falha ao entrar',
            message: 'Email ou Senha incorretos...',
            variant: DialogVariant.WARNING,
            confirmLabel: 'Fechar',
            size: DialogSize.SMALL,
          };
          this.dialogService.openMessage(rankMessageConfig);
        }
      },
      error: (err) => {
        const rankMessageConfig: MessageDialogConfig = {
          title: 'Falha ao realizar o login',
          message: err.error.message,
          variant: DialogVariant.WARNING,
          confirmLabel: 'Fechar',
          size: DialogSize.SMALL,
        };
        this.dialogService.openMessage(rankMessageConfig);
      },
    });
  }

  ngOnInit() {
    this.userService.updateColorBlindFilter(-1);
    this.preloadBackground();
  }

  goToSignin() {
    this.router.navigate(['/signin']);
  }
}