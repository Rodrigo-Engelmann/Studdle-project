import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id?: number;
  video_url?: string;
  description?: string;
  title: string;
  createdDate?: string;
  last_update?: string;
  sequence: number;
}

export interface VideoStatus {
  user_id: number;
  video_id: number;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private api = 'http://localhost:3000/videos';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Video>): Observable<Video> {
    return this.http.post<Video>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Video[]> {
    return this.http.get<Video[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<Video>): Observable<Video> {
    return this.http.patch<Video>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET ORDENADO POR SEQUÊNCIA
  findOrdered(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.api}/ordered`);
  }

  // GET COMENTÁRIOS DO VÍDEO
  findComments(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/comments`);
  }

  // MARCAR COMO CONCLUÍDO
  markComplete(id: number, user_id: number): Observable<VideoStatus> {
    return this.http.post<VideoStatus>(`${this.api}/${id}/complete`, { user_id });
  }

  // GET STATUS DE CONCLUSÃO
  getStatus(id: number, userId: number): Observable<VideoStatus> {
    return this.http.get<VideoStatus>(`${this.api}/${id}/status/${userId}`);
  }
}