import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VideoStatus {
  user_id: number;
  video_id: number;
  completed: boolean;
}

export interface VideoCompletions {
  video_id: number;
  total: number;
  completed: number;
}

@Injectable({
  providedIn: 'root',
})
export class VideoStatusService {
  private api = 'http://localhost:3000/video-status';

  constructor(private http: HttpClient) {}

  // CRIAR OU ATUALIZAR STATUS
  upsert(data: VideoStatus): Observable<VideoStatus> {
    return this.http.post<VideoStatus>(this.api, data);
  }

  // GET STATUS DE TODOS OS VÍDEOS DE UM USUÁRIO
  findByUser(userId: number): Observable<VideoStatus[]> {
    return this.http.get<VideoStatus[]>(`${this.api}/user/${userId}`);
  }

  // GET CONTAGEM DE CONCLUSÕES DE UM VÍDEO
  findCompletionsByVideo(videoId: number): Observable<VideoCompletions> {
    return this.http.get<VideoCompletions>(`${this.api}/video/${videoId}/completions`);
  }

  // GET STATUS DE UM VÍDEO ESPECÍFICO PARA UM USUÁRIO
  findOne(userId: number, videoId: number): Observable<VideoStatus> {
    return this.http.get<VideoStatus>(`${this.api}/user/${userId}/video/${videoId}`);
  }
}