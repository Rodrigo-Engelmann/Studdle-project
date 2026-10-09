import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id?: number;
  link: string;
  video_url?: string;
  description?: string;
  title: string;
  createdDate?: string;
  last_update?: string;
  sequence: number;
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

  // GET BY URL
  findByURL(url: string): Observable<Video> {
    return this.http.get<Video>(`${this.api}/findByURL/${url}`)
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

  // GET VIDEO DATA
  getYTvideoData(url: string) {
    return this.http.get<any>(
      `${this.api}/getYoutubeData`,
      { params: { url: url } }
    );
  }
}