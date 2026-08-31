import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/users/users.service';
import { VideoService } from '../../services/videos/videos.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { video } from '../../../../common/video';

@Component({
  selector: 'app-view-video',
  imports: [
    MatIconModule
    , MatMenuModule
    , MatButtonModule
  ],
  templateUrl: './view-video.html',
  styleUrl: './view-video.scss',
})
export class ViewVideo implements OnInit {
  constructor(private router: Router
            , private userService: UserService
            , private videoService: VideoService
            , private route: ActivatedRoute
            , private sanitizer: DomSanitizer
  ) {}

  embedUrl!: SafeResourceUrl;
  videoData!: video;
  descriptionExpanded = false;

  @ViewChild('descriptionContainer')
  descriptionContainer!: ElementRef<HTMLDivElement>;

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
    this.route.paramMap.subscribe(params => {
      const videoUrl: string | null = params.get('videoUrl');

      if (videoUrl !== null)
        this.videoService.findByURL(videoUrl).subscribe((res: any)=>{
          // this.embedUrl = res.link;
          this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${res.video_url}?controls=1`
          );
          this.videoData = res;
        })
    });

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
