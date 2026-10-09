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

// Common
import { video } from '../../../../common/video';

// Others
import { firstValueFrom } from 'rxjs';

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
  @ViewChild('descriptionContainer')
  descriptionContainer!: ElementRef<HTMLDivElement>;

  embedUrl!: SafeResourceUrl;
  videoData!: video;
  descriptionExpanded = false;
  profile_picture: any;

  constructor(private router: Router
            , private userService: UserService
            , private videoService: VideoService
            , private route: ActivatedRoute
            , private sanitizer: DomSanitizer
            , private taskContentService: TaskContentService
            , private taskContentStatusService: TaskContentStatusService
  ) {}

  // sistema de popup da profile-picture:
  Configuracoes() {
    console.log("Usuário clicou em configurações");
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }

  ngOnInit(): void {
    let userData: any = undefined;
    this.userService.getProfile().subscribe({
      next: (res) => {
        userData = res.user;
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;
      },
      error: (err) => {
        console.error("Failed to find profile:", err);
        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });

    this.route.paramMap.subscribe(params => {
      const videoUrl: string | null = params.get('videoUrl');

      if (videoUrl !== null)
        this.videoService.findByURL(videoUrl).subscribe(async(res: any)=>{
          this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${res.video_url}?controls=1`
          );

          const taskContent: any = await this.getTaskContent(res.id);
          console.log("IJXFJIOSDJOISDIOJFJISOD", taskContent)
          const taskContentId: number = taskContent[0].id;
          const userId: number = userData.id;
          if (userData) {
            this.taskContentStatusService.findOne(userId, taskContentId).subscribe({
              next: async (taskStatus) => {
                if (!taskStatus) {
                  const data: object = {
                    task_content_id: taskContentId
                    , user_id: userId
                    , completed: true
                  };
                  console.log("IJXFJIOSDJOISDIOJFJISOD", data)
                  await this.taskContentStatusService.create(data).subscribe({
                    next: (res) => {
                      console.log("iojsdfgiojsdfgjiosfgijo: ", res);
                    },
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

          this.videoData = res;
        })
    });
  }

  getTaskContent(videoId: number): any {
    const taskContent: any = firstValueFrom(this.taskContentService.findByVideo(videoId));
    return taskContent;
  }
}
