import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/users/users.service';

@Component({
  selector: 'app-view-video',
  imports: [MatIconModule, MatMenuModule,MatButtonModule],
  templateUrl: './view-video.html',
  styleUrl: './view-video.scss',
})
export class ViewVideo {
  constructor(private router: Router,private userService: UserService) {}

  // sistema de popup da profile-picture:
  Configuracoes() {
    console.log("Usuário clicou em configurações");
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }

  
  profile_picture: any;

  ngOnInit():void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;
      },
      error: (err) => {
        console.error("Erro ao buscar perfil:", err);

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

}
