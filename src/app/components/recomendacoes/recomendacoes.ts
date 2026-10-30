// angular
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

// services
import { VideoService } from '../../../app/services/videos/videos.service'
import { MaterialService } from '../../services/materials/materials.service'
import { UserService } from '../../services/users/users.service';

// others
import { material } from '../../../../common/material';
import { video } from '../../../../common/video';

// components
import { VideoCard } from '../video-card/video-card';
import { MaterialCard } from '../material-card/material-card';

@Component({
  selector: 'app-recomendacoes',
  imports: [
    VideoCard,
    MaterialCard,
    MatProgressSpinnerModule,
  ],
  templateUrl: './recomendacoes.html',
  styleUrl: './recomendacoes.scss',
})
export class Recomendacoes implements OnInit {
  materials: material[] = [];
  videos: video[] = [];
  isLoading: any = { videos: true, materials: true };
  userModuleId: number = -1;

  constructor(private userService: UserService
            , private videoService: VideoService
            , private materialService: MaterialService
            , private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContent();

    this.updateUserData(); // não sei por que isso existe, mas vai ser útil no futuro para aplicar filtro de daltonismo, na verdade nem pra isso, spa só remover msm pq essa parte vai ser feita nos '...-card.component's
  }
  
  loadContent(): void {
    this.loadVideos();
    this.loadMaterials();
  }

  updateUserData(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        const user = res.user;
        this.userService.updateColorBlindFilter(user.colorblindness);
        this.userService.updateColorScheme(user.color_scheme??1);
      },
      error: (err) => {
        console.error("Failed to find profile:", err);

        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });
  }

  //#region load video and materials
  async loadVideos() {
    await this.videoService.getNextVideos().subscribe((res: any) => {
      res.map((a: any)=>this.videos.push(a));
      this.isLoading.videos = false;
    });
  }

  async loadMaterials() {
    await this.materialService.getNextMaterials().subscribe((res: any) => {
      res.map((a: any)=>this.materials.push(a));
      this.isLoading.materials = false;
    });
  }
  //#endregion


  updateSingularVideo(event: any): void {
    const index: number = this.videos.findIndex((v)=>v.id===event.id)
    if (event.deletedVideo) {
      this.videos.splice(index,1);
      return;
    }

    this.videos[index] = event;
  }

  updateSingularMaterial(event: any): void {
    const index: number = this.materials.findIndex((v)=>v.id===event.id)
    if (event.deletedMaterial) {
      this.materials.splice(index,1);
      return;
    }

    this.materials[index] = event;
  }
}
