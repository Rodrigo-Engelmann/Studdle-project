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
export class Signin implements OnInit {
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

  bgLoaded = false;
  private readonly bgUrl = '/assets/images/background_studdle.png';

  constructor(private router: Router
            , private userService: UserService
            , private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    const img = new Image();
    img.src = this.bgUrl;

    if (img.complete) {
      this.bgLoaded = true;
      return;
    }

    img.onload = () => this.bgLoaded = true;
    img.onerror = () => this.bgLoaded = true;
  }

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
      const rankMessageConfig: MessageDialogConfig = {
        title: 'Falha ao cadastrar conta',
        message: "Campos de 'senha' e 'confirmar senha' estão com valores diferentes",
        variant: DialogVariant.WARNING,
        confirmLabel: 'Fechar',
        size: DialogSize.SMALL,
      }
      this.dialogService.openMessage(rankMessageConfig);
      return;
    }

    const userData = { user_name: this.userName, email: this.email, password: this.password };

    this.userService.register(userData).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.router.navigate(['/recomendacoes']);
          this.userService.updateColorBlindFilter(-1)
        } else {
          const rankMessageConfig: MessageDialogConfig = {
            title: 'Falha ao cadastrar conta',
            message: `Ocorreu um erro inesperado no cadastro da conta`,
            variant: DialogVariant.WARNING,
            confirmLabel: 'Fechar',
            size: DialogSize.SMALL,
          }
          this.dialogService.openMessage(rankMessageConfig);
        }
      },
      error: (err) => {
        const rankMessageConfig: MessageDialogConfig = {
          title: 'Falha ao cadastrar conta',
          message: err.error.message,
          variant: DialogVariant.WARNING,
          confirmLabel: 'Fechar',
          size: DialogSize.SMALL,
        }
        this.dialogService.openMessage(rankMessageConfig);
      }
    });
  }
}