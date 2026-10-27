// angular
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// components
import { VideoCard } from '../video-card/video-card';

// services
import { DialogService } from '../services/dialog.service';
import { VideoService } from '../../../app/services/videos/videos.service';
import { FilterDataService } from '../services/filterData.service';
import { UserDataBridgeService } from '../services/userData-bridge.service';

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import { video } from '../../../../common/video';
import { firstValueFrom, takeUntil, Subject } from 'rxjs';

// search
import Fuse from 'fuse.js';

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
  userData: any = undefined;

  private destroy$ = new Subject<void>();

  constructor(private dialogService: DialogService
            , private videoService: VideoService
            , private filterDataService: FilterDataService
            , private userDataBridgeService: UserDataBridgeService
  ) {}

  ngOnInit(): void {
    this.loadVideos();

    this.filterDataService.FilterData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filterData => {
        this.updateFilterData(filterData);
    });

    this.userDataBridgeService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bridgeUserData: any) => {
        this.userData = bridgeUserData;
    });
  }

  async updateFilterData(filterDataList: any): Promise<void> {
    if (!filterDataList?.length)
      return;

    const filterData: any = filterDataList.find((filter: any) => filter.pageIndex === 1);
    if (!filterData && this.videos.length)
      return;

    this.videos = [];
    this.isLoading = true;
    let newVideoData: any[] = [];
    if (filterData.selectedModule?.id === -1 || !filterData.selectedModule) {
      newVideoData = await firstValueFrom(this.videoService.findAll());
    } else
      newVideoData = await firstValueFrom(this.videoService.getVideosByModule(filterData.selectedModule.id));

    if (filterData.selectedCategory !== -1 && filterData.selectedCategory)
      newVideoData = newVideoData.filter((vid:any) => vid.task_id === filterData.selectedCategory);
    
    if (filterData.searchQuery && filterData.searchQuery !== '') {
      const fuse = new Fuse(newVideoData, {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'description', weight: 0.3 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2
      });

      const resultados = fuse.search(filterData.searchQuery);
      
      newVideoData = resultados.map((r: any) => r.item);
    }

    this.isLoading = false;
    this.videos = newVideoData;
  }

  async loadVideos(): Promise<void> {
    await this.videoService.findAll().subscribe((res: any) => {
      res.map((a: any)=>this.videos.push(a));
      this.isLoading = false;
    });
  }

  async newVideoDialog() {
    this.dialogService.openForm<any>({
      title: 'Criar Vídeo',
      size: DialogSize.LARGE,
      fields: [
        { key: 'link', label: 'URL do vídeo do Youtube', type: FieldType.URL, required: true, width: FieldWidth.HALF },
        { key: 'sequence', label: 'Sequência dos vídeos', type: FieldType.NUMBER, required: true }
      ],
    }).subscribe(async (res: any) => {
      if (!res.confirmed)
        return;

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
