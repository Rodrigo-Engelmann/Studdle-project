// angular
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

// services
import { DialogService } from '../services/dialog.service'

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import { video } from '../../../../common/video';
import { VideoService } from '../../../app/services/videos/videos.service'
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-vid-card',
  imports: [
    MatMenuModule
    , MatIconModule
  ],
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})

export class VideoCard implements OnChanges {
  @Input() video: video = new video;

  @Output() updateData = new EventEmitter<video>();

  videoPrefix: string = 'https://www.youtube.com/watch?v=';
  createdDateFormat: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const videoCreatedDate = changes['video'].currentValue.createdDate
    if (videoCreatedDate)
      this.createdDateFormat = new Date(videoCreatedDate).toLocaleDateString('pt-BR');
  }

  constructor(private dialogService: DialogService
            , private videoService: VideoService
            , private router: Router) {}

  openVideo(): void {
    this.router.navigate([`/video/watch/${this.video.video_url}`]);
  }


  async getYTdata(videoUrl: string): Promise<object> {
    const ytData = await firstValueFrom(
      this.videoService.getYTvideoData(videoUrl)
    );
    return ytData;
  }

  //#region: update
  settingsSelect() {
    this.dialogService.openForm<any>({
      title: 'Criar vídeo',
      model: {link: this.video.link, sequence: this.video.sequence},
      size: DialogSize.LARGE,
      fields: [
        { key: 'link', label: 'URL do vídeo do Youtube', type: FieldType.URL, required: true, width: FieldWidth.HALF },
        { key: 'sequence', label: 'Sequência dos vídeos', type: FieldType.NUMBER, required: false }
      ],
    }).subscribe(async (res: any) => {
      const formdata = res.data;

      const URL = formdata.link.replace(this.videoPrefix,'');
      formdata.video_url = URL;

      const YTvideoData: any = await this.getYTdata(formdata.link);
      if (YTvideoData) {
        formdata.title       = YTvideoData.title;
        formdata.description = YTvideoData.description;
        formdata.thumbnail   = YTvideoData.thumbnail;
      }

      this.videoService.update(this.video.id, formdata).subscribe((updateRes: any) => {
        this.updateData.emit(updateRes);
      });
    });
  }
  //#endregion
  
  
  
  
  //#region: delete
  deleteSelect() {
    this.videoService.delete(this.video.id).subscribe((res: any) => {
      if (res.deleted) {
        this.video.deletedVideo = true;
        this.updateData.emit(this.video);
      }
    });
  }
  //#endregion
}