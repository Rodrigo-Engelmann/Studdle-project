// angular
import { Component } from '@angular/core';
// import { Route, Router } from '@angular/router';

// components
import { VideoCard } from '../video-card/video-card';

// services
import { DialogService } from '../services/dialog.service'

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import videos from '../../../assets/files/videos.json';
import { video } from '../../../../common/video';
import { VideoService } from '../../../app/services/videos/videos.service'


@Component({
  selector: 'app-videos',
  imports: [
    VideoCard,
  ],
  standalone: true,
  templateUrl: './videos.html',
  styleUrl: './videos.scss'
})
export class Videos {
  videos: video[] = videos as video[];

  constructor(private dialogService: DialogService
            , private videoService: VideoService
  ) {}


  newVideoDialog() {
    this.dialogService.openForm<any>({
      title: 'Adicionar vídeo',
      size: DialogSize.LARGE,
      fields: [
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: true, width: FieldWidth.HALF },
        { key: 'description', label: 'Descrição', type: FieldType.TEXTAREA, rows: 4 },
        { key: 'video_url', label: 'URL do vídeo do Youtube', type: FieldType.URL, required: true, width: FieldWidth.HALF },
        { key: 'categoria', label: 'Categoria', type: FieldType.SELECT, required: false,
          options: 
            [
              { label: 'JavaScript', value: 'js' }
              , { label: 'Banco de dados', value: 'db' }
            ] 
        },
        { key: 'sequence', label: 'Categoria', type: FieldType.NUMBER, required: false }
      ],
    }).subscribe(res => {
      this.videoService.create(res?.data).subscribe((postRes) => {
        console.log("postRes: ", postRes)
      })
      // console.log("!!! res: ", res);
    });
  }
}
