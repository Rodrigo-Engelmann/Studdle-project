// Angular
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Services
import { UserService } from '../../services/users/users.service';
import { VideoService } from '../../services/videos/videos.service';
import { TaskContentService } from '../../services/task_contents/task_contents.service';
import { TaskContentStatusService } from '../../services/taskcontent-status/taskcontent-status.service'
import { DialogService } from '../services/dialog.service';

// Common
import { video } from '../../../../common/video';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// Others
import { firstValueFrom } from 'rxjs';

// components
import { CommentsComponent } from '../comments/comments.component';

@Component({
  selector: 'app-view-video',
  imports: [
    MatIconModule
    , MatMenuModule
    , MatButtonModule
    , CommentsComponent
  ],
  templateUrl: './view-video.html',
  styleUrl: './view-video.scss',
})
export class ViewVideo implements OnInit {
  @ViewChild('descriptionContainer')
  descriptionContainer!: ElementRef<HTMLDivElement>;

  embedUrl: SafeResourceUrl | null = null;
  videoData: video = new video;
  descriptionExpanded = false;
  profile_picture: any;
  videoPrefix: string = 'https://www.youtube.com/watch?v=';
  userData: any = undefined;
  privilege: number = 0;

  constructor(private router: Router
            , private userService: UserService
            , private videoService: VideoService
            , private route: ActivatedRoute
            , private sanitizer: DomSanitizer
            , private taskContentService: TaskContentService
            , private taskContentStatusService: TaskContentStatusService
            , private dialogService: DialogService
  ) {}

  // sistema de popup da profile-picture:
  Configuracoes() {
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.userData = res.user;
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;

        this.privilege = res.user.privileges;
      },
      error: (err) => {
        console.error("Failed to find profile:", err);
        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });

    this.updateVideoData();
  }

  updateVideoData() {
    this.route.paramMap.subscribe(params => {
      const videoUrl: string | null = params.get('videoUrl');

      if (videoUrl !== null)
        this.videoService.findByURL(videoUrl).subscribe(async(res: any)=>{
          this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${res.video_url}?controls=1`
          );

          const taskContent: any = await this.getTaskContent(res.id);
          if (taskContent !== undefined && taskContent.length) {
            const taskContentId: number = taskContent[0].id;
            const userId: number = this.userData.id;
            if (this.userData) {
              this.taskContentStatusService.findOne(userId, taskContentId).subscribe({
                next: async (taskStatus) => {
                  if (!taskStatus) {
                    const data: object = {
                      task_content_id: taskContentId
                      , user_id: userId
                      , completed: true
                    };
                    await this.taskContentStatusService.create(data).subscribe({
                      error: (err) => {
                        console.error("--error: ", err);
                      }
                    });
                    return
                  }
                },
                error: (err) => {
                  console.error("--error: ", err);
                }
              });
            }
          }
          this.videoData = res;
        })
    });
  }

  getTaskContent(videoId: number): any {
    try {
      const taskContent: any = firstValueFrom(this.taskContentService.findByVideo(videoId));
      return taskContent;
    } catch (error) {
      return undefined;
    }
  }

  goBack() {
    this.router.navigate(['/videos']);
  }

  settingsSelect() {
    this.dialogService.openForm<any>({
      title: 'Atualizar vídeo',
      model: {link: this.videoData.link, sequence: this.videoData.sequence},
      size: DialogSize.LARGE,
      fields: [
        { key: 'link', label: 'URL do vídeo do Youtube', type: FieldType.URL, required: true, width: FieldWidth.HALF, maxLength: 500 },
        { key: 'sequence', label: 'Sequência dos vídeos', type: FieldType.NUMBER, required: true }
      ],
    }).subscribe(async (res: any) => {
      if (!res.confirmed)
        return;
    
      const formdata = res.data;
      const URL = formdata.link.replace(this.videoPrefix,'');
      formdata.video_url = URL;

      const YTvideoData: any = await this.getYTdata(formdata.link);
      if (YTvideoData) {
        formdata.title       = YTvideoData.title;
        formdata.description = YTvideoData.description;
        formdata.thumbnail   = YTvideoData.thumbnail;
      }

      this.videoService.update(this.videoData.id, formdata).subscribe((_updateRes: any) => {
        this.updateVideoData();
      });
    });
  }

  async getYTdata(videoUrl: string): Promise<object | undefined> {
    try {
      const ytData: any = await firstValueFrom(
        this.videoService.getYTvideoData(videoUrl)
      );
      return ytData;
    } catch (err) {
      console.error("--error: ", err);
      return;
    }
  }
}
