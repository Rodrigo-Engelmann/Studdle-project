import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/users/users.service';

@Component({
  selector: 'app-view-material',
  imports: [MatIconModule,MatMenuModule,MatButtonModule],
  templateUrl: './view-material.html',
  styleUrl: './view-material.scss',
})
export class ViewMaterial {
  constructor(private router: Router,private userService: UserService) {}

  search_header: HTMLElement | null = null;
  profile_picture: any;

  ngAfterViewInit() {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;
    if (this.search_header)
      this.search_header.style.zIndex = '1012312';

    const header = document.querySelector('app-tab-header') as HTMLElement;
    if (header) {
      // header.style.height = '100%';
      header.style.width = '100%';
      header.style.display = 'block';
    }

    const page_container = document.getElementsByClassName('.page-container')[0] as HTMLElement;
    if (page_container)
      page_container.style.height = '100%';

  }

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

  // sistema de popup da profile-picture:
  Configuracoes() {
    console.log("Usuário clicou em configurações");
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }
  
}
