// angular
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// components
import { VideoCard } from '../video-card/video-card';

// services
import { DialogService } from '../services/dialog.service'

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import { video } from '../../../../common/video';
import { VideoService } from '../../../app/services/videos/videos.service'
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-videos',
  imports: [
    VideoCard
    , MatProgressSpinnerModule
    , MatIconModule
  ],
  standalone: true,
  templateUrl: './videos.html',
  styleUrl: './videos.scss'
})
export class Videos implements OnInit {
  videos: video[] = [];
  videoPrefix: string = 'https://www.youtube.com/watch?v=';
  isLoading: boolean = true;

  constructor(private dialogService: DialogService
            , private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  async loadVideos() {
    await this.videoService.findAll().subscribe((res: any) => {
      res.map((a: any)=>this.videos.push(a));
      this.isLoading = false;
    });
  }

  async newVideoDialog() {
    this.dialogService.openForm<any>({
      title: 'Criar vídeo',
      size: DialogSize.LARGE,
      fields: [
        { key: 'link', label: 'URL do vídeo do Youtube', type: FieldType.URL, required: true, width: FieldWidth.HALF },
        { key: 'sequence', label: 'Sequência dos vídeos', type: FieldType.NUMBER, required: false }
      ],
    }).subscribe(async (res: any) => {
      const formData = res.data;
      const URL = formData.link.replace(this.videoPrefix,'');
      formData.video_url = URL;

      const YTvideoData: any = await this.getYTdata(formData.link);
      if (YTvideoData) {
        formData.title       = YTvideoData.title;
        formData.description = YTvideoData.description;
        formData.thumbnail   = YTvideoData.thumbnail;
      }

      this.videoService.create(formData).subscribe((postRes: any) => {
        this.videos.push(postRes);
      });
    });
  }

  async getYTdata(videoUrl: string): Promise<object> {
    const ytData = await firstValueFrom(
      this.videoService.getYTvideoData(videoUrl)
    );
    return ytData;
  }

  updateSingular(event: any): void {
    const index: number = this.videos.findIndex((v)=>v.id===event.id)
    if (event.deletedVideo) {
      this.videos.splice(index,1);
      return;
    }

    this.videos[index] = event;
  }
}
